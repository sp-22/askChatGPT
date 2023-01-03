# askChatGPT
chatgpt browser extension, to improve workflow.
It has two key features:
1) Shows Google search query response from ChatGPT
2) Can select text and can use context menu to Ask ChatGPT
## Steps to build it
1) `npm i` to install all node libraries
2) `npx esbuild src/content.js src/background.js --bundle --outdir=build` to build content and background script
3) Use built scripts to load upacked in chrome
