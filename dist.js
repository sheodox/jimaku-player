const fs = require('fs'),
	script = fs.readFileSync(`./dist/main.js`).toString();

const userscript = `// ==UserScript==
// @name         VRV Subtitler
// @namespace    http://tampermonkey.net/
// @version      0.1.3
// @description  Display SRT format subtitles on VRV
// @author       sheodox
// @match        https://static.vrv.co/vilos/player.html
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

${script}
`;

fs.writeFileSync(`./dist/vrv-subtitler.user.js`, userscript);
console.log(`script packaged`);