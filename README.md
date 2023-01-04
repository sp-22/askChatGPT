# askChatGPT
chatgpt browser extension, to improve workflow.
It has two key features:
1) Shows Google search query response from ChatGPT
![Screen Recording - 4 January 2023](https://user-images.githubusercontent.com/68839235/210546594-524daf6f-a023-4bb3-a93a-c0dd2de441a4.gif)

2) Can select text and can use context menu to Ask ChatGPT
![Screen Recording - 4 January 2023 (1)](https://user-images.githubusercontent.com/68839235/210546655-3e167eea-3bbb-4f31-8b9c-fe57e4b86276.gif)

## Steps to build it
1) `npm i` to install all node libraries
2) `npx esbuild src/content.js src/background.js --bundle --outdir=build` to build content and background script
3) Use built scripts to load upacked in chrome
## Special Thanks
[OpenAI](https://openai.com/blog/chatgpt/) for making this super powerful AI. 
