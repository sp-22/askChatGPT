import ExpiryMap from "expiry-map";
import { v4 as uuidv4 } from "uuid";
import { createParser } from "eventsource-parser";

let answer = [];
const KEY_ACCESS_TOKEN = "accessToken";
const cache = new ExpiryMap(10 * 1000);

// Create a context menu item
chrome.contextMenus.create({
  id: "ask-chatgpt",
  title: "Ask ChatGPT",
  contexts: ["selection"],
});

// Listen for when the user clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ask-chatgpt") {
    // Send a message to the content script
    if (info.selectionText) {
      chrome.tabs.sendMessage(tab.id, { type: "OPEN_MODAL" });
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
    throw new Error("UNAUTHORIZED");
  }
  cache.set(KEY_ACCESS_TOKEN, resp.accessToken);
  return resp.accessToken;
}
//get answer from chatgpt
async function callGPT(query) {
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
  //console.log(re);
  const parser = createParser((event) => {
    if (event.type === "event") {
      if (event.data != "[DONE]") {
        let data = JSON.parse(event.data);
        answer = data.message.content.parts[0];
      }
    }
  });
  for await (const chunk of streamAsyncIterable(re.body)) {
    const str = new TextDecoder().decode(chunk);
    parser.feed(str);
  }
  console.log(answer);
  return answer;
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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "callGPT") {
    console.log("background")
    //result = await callGPT(request.query);
    console.log("result")
    //console.log(result)
    //sendResponse(result);
    callGPT(request.query).then(sendResponse);
    return true;
  }
});
