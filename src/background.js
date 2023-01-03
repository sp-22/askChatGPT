import ExpiryMap from "expiry-map";
import { v4 as uuidv4 } from "uuid";
import { createParser } from "eventsource-parser";

let answer = [];
const KEY_ACCESS_TOKEN = "accessToken";
const cache = new ExpiryMap(10 * 1000);

// Create a context menu item
chrome.contextMenus.create({
  id: "askchatgpt",
  title: "Ask ChatGPT",
  contexts: ["selection"],
});

// Listen for when the user clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "askchatgpt") {
    // Send a message to the content script
    if (info.selectionText) {
      const selectedText = info.selectionText;
      chrome.tabs.sendMessage(tab.id, { type: "OPEN_MODAL",selectedText});
    }
  }
});

//Get session token of chatgpt
async function getAccessToken() {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN);
  }
  const resp = await fetch("https://chat.openai.com/api/auth/session")
    .then((r) => r.json())
    .catch(() => ({}));
  if (!resp.accessToken) {
    answer = "UNAUTHORIZED";
    throw new Error("UNAUTHORIZED");
  }
  cache.set(KEY_ACCESS_TOKEN, resp.accessToken);
  return resp.accessToken;
}
//get answer from chatgpt
async function callGPT(query,callback) {
  const accessToken = await getAccessToken();
  const re = await fetch("https://chat.openai.com/backend-api/conversation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action: "next",
      messages: [
        {
          id: uuidv4(),
          role: "user",
          content: {
            content_type: "text",
            parts: [query],
          },
        },
      ],
      model: "text-davinci-002-render",
      parent_message_id: uuidv4(),
    }),
  });
  console.log(re);
  
  const parser = createParser((event) => {
    if (event.type === "event") {
      if (event.data != "[DONE]") {
        let data = JSON.parse(event.data);
        answer = data?.message?.content?.parts?.[0];
        callback(answer);
      }
    }
  });
  for await (const chunk of streamAsyncIterable(re.body)) {
    const str = new TextDecoder().decode(chunk);
    parser.feed(str);
  }
  console.log(answer);
}
//collect packets
async function* streamAsyncIterable(stream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

//connection to content
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    if(msg.action=="callGPT"){
        try {
          await callGPT(msg.question, (answer) => {
            port.postMessage({ answer });
          });
        } catch (err) {
          console.error(err);
          port.postMessage({ error: err.message });
          cache.delete(KEY_ACCESS_TOKEN);
        }
    }
  });
});