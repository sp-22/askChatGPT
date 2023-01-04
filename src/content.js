//get value from search bar
const searchInput = document.getElementsByName("q")[0];
if (searchInput && searchInput.value) {
  //    callGPT(searchInput.value)
  getAnswer(searchInput.value);
}

//show answer to browser
function getAnswer(question) {
  //container to show on browser
  const container = document.createElement("div");
  container.className = "chat_gpt_container";

  const attribution = document.createElement("a");
  attribution.textContent = "Ask ChatGPT";
  attribution.href = "https://openai.com/blog/chatgpt/";
  attribution.target = "_blank";
  attribution.classList.add("chat_gpt_container_attribution");
  container.appendChild(attribution);
  const newContainer = document.createElement("div");
  container.appendChild(newContainer);
  const siderbarContainer = document.getElementById("rhs");
  if (siderbarContainer) {
    siderbarContainer.prepend(container);
  } else {
    container.classList.add("sidebar-free");
    document.getElementById("rcnt").appendChild(container);
  }
  newContainer.innerHTML = "<p>Waiting for ChatGPT ...</p>";
  connectBackground(question,newContainer);
}

//to open model on event of context menu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "OPEN_MODAL") {
    const selectedText = request.selectedText;
    console.log(selectedText);
    const modalx = `<dialog class="main-dialog">
      <div class="modal-title-bar">
        <span class="name">Ask ChatGPT</span>
        <button class="close-button">&times;</button>
      </div>
      <div class="modal-content">
        <span class="modal-content-title">Prompt</span>
        <span id= "modal-prompt"></span>
        <span class="modal-content-title">Response</span>
        <div class="modal-body" id= "modalx-body"></div>
      </div>
      <span class="modal-footer">Response generated with ChatGPT by OpenAI<span>
    </dialog>`
  document.body.innerHTML += modalx;
  var dialog = document.querySelector("dialog")
  document.getElementById("modal-prompt").innerHTML = selectedText;
  dialog.querySelector("button").addEventListener("click", function() {
    dialog.close()
  })
  dialog.showModal()
  const container = document.getElementById("modalx-body");
  connectBackground(selectedText,container);  
}
});

async function connectBackground(question,container){
  //conecting background script to get info
  const port = chrome.runtime.connect();
  port.onMessage.addListener(function (msg) {
    if (msg.answer) {
      container.innerHTML = `${msg.answer}`;
    } else if (msg.error === "UNAUTHORIZED") {
      container.innerHTML =
        'Please login at <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> first';
    } else {
      container.innerHTML = "Failed to load response from ChatGPT";
    }
  });
  port.postMessage({
    action: "callGPT",
    question: question,
  });
}