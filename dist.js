const fs = require('fs'),
	packagedScriptPath = `./dist/jimaku-player.user.js`,
	lastPackagedScript = fs.readFileSync(packagedScriptPath).toString(),
	script = fs.readFileSync(`./static/subtitler.js`).toString();

let versionBase = '0.4.';
const [_, oldVersion] = lastPackagedScript.match(/@version\s*\d+\.\d+\.(\d+)/);

//if packaging a release version, increment the version
if (process.argv.includes('release')) {
	versionBase += parseInt(oldVersion) + 1;
}
else {
	versionBase += oldVersion;
}

const userscript = `// ==UserScript==
// @name         字幕プレーヤー
// @namespace    https://github.com/sheodox
// @version      ${versionBase}
// @description  Study Japanese by using Japanese subtitles on VRV!
// @author       sheodox
// @match        https://static.vrv.co/vilos/player.html*
// @match        https://static.crunchyroll.com/vilos-v2/web/vilos/player.html*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

${script}
`;

fs.writeFileSync(packagedScriptPath, userscript);
console.log(`script packaged`);