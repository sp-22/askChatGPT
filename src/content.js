
//get value from search bar
const searchInput = document.getElementsByName("q")[0];
if (searchInput && searchInput.value) {
  //    callGPT(searchInput.value)
  getAnswer(searchInput.value);
}

function getAnswer(query) {
  chrome.runtime.sendMessage({ action: "callGPT", query },(response) => {
    console.log("content:",JSON.stringify(response));
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
