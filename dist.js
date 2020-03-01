const fs = require('fs'),
	packagedScriptPath = `./dist/vrv-subtitler.user.js`,
	lastPackagedScript = fs.readFileSync(packagedScriptPath).toString(),
	script = fs.readFileSync(`./dist/main.js`).toString();

let versionBase = '0.1.';
const [_, oldVersion] = lastPackagedScript.match(/@version\s*\d+\.\d+\.(\d+)/);

//if packaging a release version, increment the version
if (process.argv.includes('release')) {
	versionBase += parseInt(oldVersion) + 1;
}
else {
	versionBase += oldVersion;
}

const userscript = `// ==UserScript==
// @name         VRV Subtitler
// @namespace    http://tampermonkey.net/
// @version      ${versionBase}
// @description  Display SRT format subtitles on VRV
// @author       sheodox
// @match        https://static.vrv.co/vilos/player.html
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

${script}
`;

fs.writeFileSync(packagedScriptPath, userscript);
console.log(`script packaged`);