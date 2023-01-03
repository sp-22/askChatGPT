# askChatGPT
chatgpt browser extension
## Steps to build it
1) `npm i` to install all node libraries
2) `npx esbuild src/content.js src/background.js --bundle --outdir=build` to build content and background script
3) Use built scripts to load upacked in broswer
