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
  attribution.textContent = "ChatGPT";
  attribution.href = "https://openai.com/blog/chatgpt/";
  attribution.target = "_blank";
  attribution.classList.add("chat_gpt_container_attribution");
  container.appendChild(attribution);

  const siderbarContainer = document.getElementById("rhs");
  if (siderbarContainer) {
    siderbarContainer.prepend(container);
  } else {
    container.classList.add("sidebar-free");
    document.getElementById("rcnt").appendChild(container);
  }

  //conecting background script to get info
  const port = chrome.runtime.connect();
  port.onMessage.addListener(function (msg) {
    if (msg.answer) {
      container.innerHTML = `<p>${msg.answer}</p>`;
    } else if (msg.error === "UNAUTHORIZED") {
      container.innerHTML =
        '<p>Please login at <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> first</p>';
    } else {
      container.innerHTML = "<p>Failed to load response from ChatGPT</p>";
    }
  });
  port.postMessage({
    action: "callGPT",
    question: question,
  });
}

//to open model from context menu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "OPEN_MODAL") {
    // Create a div element to hold the modal
    const modalDiv = document.createElement("div");
    modalDiv.innerHTML = request.html;
    document.body.appendChild(modalDiv);

    // Display the modal
    modalDiv.style.display = "block";
  }
});
