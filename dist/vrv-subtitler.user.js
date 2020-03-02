// ==UserScript==
// @name         VRV Subtitler
// @namespace    http://tampermonkey.net/
// @version      0.1.4
// @description  Display SRT format subtitles on VRV
// @author       sheodox
// @match        https://static.vrv.co/vilos/player.html
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";function o(){}n.r(t);const r=e=>e;function s(e){return e()}function i(){return Object.create(null)}function l(e){e.forEach(s)}function c(e){return"function"==typeof e}function a(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}const u="undefined"!=typeof window;let d=u?()=>window.performance.now():()=>Date.now(),f=u?e=>requestAnimationFrame(e):o;const p=new Set;function g(e){p.forEach(t=>{t.c(e)||(p.delete(t),t.f())}),0!==p.size&&f(g)}function h(e){let t;return 0===p.size&&f(g),{promise:new Promise(n=>{p.add(t={c:e,f:n})}),abort(){p.delete(t)}}}function m(e,t){e.appendChild(t)}function v(e,t,n){e.insertBefore(t,n||null)}function b(e){e.parentNode.removeChild(e)}function x(e){return document.createElement(e)}function y(e){return document.createTextNode(e)}function $(){return y(" ")}function w(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function k(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function j(e,t){t=""+t,e.data!==t&&(e.data=t)}function S(e,t,n,o){e.style.setProperty(t,n,o?"important":"")}function _(e,t){const n=document.createEvent("CustomEvent");return n.initCustomEvent(e,!1,!1,t),n}let C,E,P=0,M={};function R(e,t,n,o,r,s,i,l=0){const c=16.666/o;let a="{\n";for(let e=0;e<=1;e+=c){const o=t+(n-t)*s(e);a+=100*e+`%{${i(o,1-o)}}\n`}const u=a+`100% {${i(n,1-n)}}\n}`,d=`__svelte_${function(e){let t=5381,n=e.length;for(;n--;)t=(t<<5)-t^e.charCodeAt(n);return t>>>0}(u)}_${l}`;if(!M[d]){if(!C){const e=x("style");document.head.appendChild(e),C=e.sheet}M[d]=!0,C.insertRule(`@keyframes ${d} ${u}`,C.cssRules.length)}const f=e.style.animation||"";return e.style.animation=`${f?`${f}, `:""}${d} ${o}ms linear ${r}ms 1 both`,P+=1,d}function q(e,t){e.style.animation=(e.style.animation||"").split(", ").filter(t?e=>e.indexOf(t)<0:e=>-1===e.indexOf("__svelte")).join(", "),t&&!--P&&f(()=>{if(P)return;let e=C.cssRules.length;for(;e--;)C.deleteRule(e);M={}})}function O(e){E=e}function T(){if(!E)throw new Error("Function called outside component initialization");return E}function A(){const e=T();return(t,n)=>{const o=e.$$.callbacks[t];if(o){const r=_(t,n);o.slice().forEach(t=>{t.call(e,r)})}}}const I=[],z=[],V=[],B=[],F=Promise.resolve();let L=!1;function N(){L||(L=!0,F.then(J))}function H(e){V.push(e)}let U=!1;const G=new Set;function J(){if(!U){U=!0;do{for(let e=0;e<I.length;e+=1){const t=I[e];O(t),D(t.$$)}for(I.length=0;z.length;)z.pop()();for(let e=0;e<V.length;e+=1){const t=V[e];G.has(t)||(G.add(t),t())}V.length=0}while(I.length);for(;B.length;)B.pop()();L=!1,U=!1,G.clear()}}function D(e){if(null!==e.fragment){e.update(),l(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(H)}}let Y;function Z(){return Y||(Y=Promise.resolve(),Y.then(()=>{Y=null})),Y}function K(e,t,n){e.dispatchEvent(_(`${t?"intro":"outro"}${n}`))}const Q=new Set;let W;function X(){W={r:0,c:[],p:W}}function ee(){W.r||l(W.c),W=W.p}function te(e,t){e&&e.i&&(Q.delete(e),e.i(t))}function ne(e,t,n,o){if(e&&e.o){if(Q.has(e))return;Q.add(e),W.c.push(()=>{Q.delete(e),o&&(n&&e.d(1),o())}),e.o(t)}}const oe={duration:0};const re="undefined"!=typeof window?window:global;function se(e,t){ne(e,1,1,()=>{t.delete(e.key)})}new Set(["allowfullscreen","allowpaymentrequest","async","autofocus","autoplay","checked","controls","default","defer","disabled","formnovalidate","hidden","ismap","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"]);let ie;function le(e){e&&e.c()}function ce(e,t,n){const{fragment:o,on_mount:r,on_destroy:i,after_update:a}=e.$$;o&&o.m(t,n),H(()=>{const t=r.map(s).filter(c);i?i.push(...t):l(t),e.$$.on_mount=[]}),a.forEach(H)}function ae(e,t){const n=e.$$;null!==n.fragment&&(l(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function ue(e,t,n,r,s,c,a=[-1]){const u=E;O(e);const d=t.props||{},f=e.$$={fragment:null,ctx:null,props:c,update:o,not_equal:s,bound:i(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:i(),dirty:a};let p=!1;var g;f.ctx=n?n(e,d,(t,n,...o)=>{const r=o.length?o[0]:n;return f.ctx&&s(f.ctx[t],f.ctx[t]=r)&&(f.bound[t]&&f.bound[t](r),p&&function(e,t){-1===e.$$.dirty[0]&&(I.push(e),N(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}(e,t)),n}):[],f.update(),p=!0,l(f.before_update),f.fragment=!!r&&r(f.ctx),t.target&&(t.hydrate?f.fragment&&f.fragment.l((g=t.target,Array.from(g.childNodes))):f.fragment&&f.fragment.c(),t.intro&&te(e.$$.fragment),ce(e,t.target,t.anchor),J()),O(u)}"function"==typeof HTMLElement&&(ie=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){for(const e in this.$$.slotted)this.appendChild(this.$$.slotted[e])}attributeChangedCallback(e,t,n){this[e]=n}$destroy(){ae(this,1),this.$destroy=o}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(){}});class de{$destroy(){ae(this,1),this.$destroy=o}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(){}}class fe{constructor(e){this.parse(e)}parse(e){const t=e.split("\n\n");this.subs=t.reduce((e,t)=>{let n=t.trim().split("\n");function o(){n.shift()}try{/^\d*$/.test(n[0])&&o();let[t,r]=n[0].replace(/,/g,".").match(/^([\d:\.\-> ]*)/)[0].split(/\-\->/),s=n[0].match(/([a-zA-Z].*)/);s=s&&s.length?s[1]:"";const i=(e=>{const t=s.match(new RegExp(`${e}:([\\d\\.]*)%`));if(t)return parseInt(t[1],10)/100})("line")||1;o(),e.push({start:this.toMS(t),end:this.toMS(r),text:n.join("\n").replace(/<\/?c.Japanese>/g,""),line:i})}catch(e){}return e},[])}getSubs(e){return this.subs.filter(t=>t.start<=e&&t.end>=e)}toMS(e){const[t,n,o]=e.trim().split(":");return 1e3*o+1e3*n*60+1e3*t*60*60}}function pe(e){let t,n,r,s;return{c(){t=x("label"),t.textContent="Select an SRT file to begin",n=$(),r=x("input"),k(t,"for","srt-upload"),k(t,"class","svelte-q6vvh2"),k(r,"type","file"),k(r,"id","srt-upload"),k(r,"accept",".srt"),k(r,"class","svelte-q6vvh2")},m(o,i){v(o,t,i),v(o,n,i),v(o,r,i),s=w(r,"change",e[0])},p:o,i:o,o:o,d(e){e&&b(t),e&&b(n),e&&b(r),s()}}}function ge(e){const t=A();return[function(e){const n=e.target.files[0],o=new FileReader;o.onload=e=>{t("srt-loaded",e.target.result)},o.readAsText(n)}]}var he=class extends de{constructor(e){var t;super(),document.getElementById("svelte-q6vvh2-style")||((t=x("style")).id="svelte-q6vvh2-style",t.textContent="label.svelte-q6vvh2{background:#fd0;border:none;cursor:pointer;padding:10px;line-height:1;font-weight:bold;color:black;text-transform:uppercase;display:inline-block;margin:2rem}label.svelte-q6vvh2:hover{background:#ffea6d}input.svelte-q6vvh2{display:none}",m(document.head,t)),ue(this,e,ge,pe,a,{})}};function me(e){const t=e-1;return t*t*t+1}function ve(e,{delay:t=0,duration:n=400,easing:o=me,x:r=0,y:s=0,opacity:i=0}){const l=getComputedStyle(e),c=+l.opacity,a="none"===l.transform?"":l.transform,u=c*(1-i);return{delay:t,duration:n,easing:o,css:(e,t)=>`\n\t\t\ttransform: ${a} translate(${(1-e)*r}px, ${(1-e)*s}px);\n\t\t\topacity: ${c-u*t}`}}function be(e,t,n){const o=e.slice();return o[12]=t[n],o}function xe(e){let t,n,o,r,s,i,c,a,u,d,f,p,g,h,y,j,S,_,C;return{c(){t=x("div"),n=x("h2"),n.textContent="Settings",o=$(),r=x("button"),r.textContent="Reselect subtitles",s=$(),i=x("button"),i.textContent="Realign subtitles",c=$(),a=x("br"),u=$(),d=x("input"),f=$(),p=x("label"),p.textContent="Show subs over video",g=$(),h=x("br"),y=$(),j=x("input"),S=$(),_=x("label"),_.textContent="Pause when tray is open",k(n,"class","svelte-1jgx8ip"),k(r,"class","svelte-1jgx8ip"),k(i,"class","svelte-1jgx8ip"),k(d,"id","show-subs"),k(d,"type","checkbox"),d.checked=!0,k(p,"for","show-subs"),k(j,"id","pause-on-tray"),k(j,"type","checkbox"),k(_,"for","pause-on-tray"),k(t,"class","settings svelte-1jgx8ip")},m(l,b){v(l,t,b),m(t,n),m(t,o),m(t,r),m(t,s),m(t,i),m(t,c),m(t,a),m(t,u),m(t,d),m(t,f),m(t,p),m(t,g),m(t,h),m(t,y),m(t,j),j.checked=e[2],m(t,S),m(t,_),C=[w(r,"click",e[8]),w(i,"click",e[9]),w(d,"change",e[5]("show-subs")),w(j,"change",e[10])]},p(e,t){4&t&&(j.checked=e[2])},d(e){e&&b(t),l(C)}}}function ye(e,t){let n,s,i,a,u,f,p,g,S,_=t[12].text+"";return{key:e,first:null,c(){n=x("li"),s=x("a"),i=y(_),u=$(),k(s,"target","_blank"),k(s,"href",a=`https://jisho.org/search/${encodeURIComponent(t[12].text.trim())}`),k(s,"rel","noopener noreferrer"),k(s,"class","svelte-1jgx8ip"),k(n,"class","svelte-1jgx8ip"),this.first=n},m(e,o){v(e,n,o),m(n,s),m(s,i),m(n,u),g=!0,S=w(s,"click",t[11])},p(e,t){(!g||1&t)&&_!==(_=e[12].text+"")&&j(i,_),(!g||1&t&&a!==(a=`https://jisho.org/search/${encodeURIComponent(e[12].text.trim())}`))&&k(s,"href",a)},i(e){g||(H(()=>{p&&p.end(1),f||(f=function(e,t,n){let s,i,l=t(e,n),a=!1,u=0;function f(){s&&q(e,s)}function p(){const{delay:t=0,duration:n=300,easing:c=r,tick:p=o,css:g}=l||oe;g&&(s=R(e,0,1,n,t,c,g,u++)),p(0,1);const m=d()+t,v=m+n;i&&i.abort(),a=!0,H(()=>K(e,!0,"start")),i=h(t=>{if(a){if(t>=v)return p(1,0),K(e,!0,"end"),f(),a=!1;if(t>=m){const e=c((t-m)/n);p(e,1-e)}}return a})}let g=!1;return{start(){g||(q(e),c(l)?(l=l(),Z().then(p)):p())},invalidate(){g=!1},end(){a&&(f(),a=!1)}}}(n,ve,{y:50,duration:200})),f.start()}),g=!0)},o(e){f&&f.invalidate(),p=function(e,t,n){let s,i=t(e,n),a=!0;const u=W;function f(){const{delay:t=0,duration:n=300,easing:c=r,tick:f=o,css:p}=i||oe;p&&(s=R(e,1,0,n,t,c,p));const g=d()+t,m=g+n;H(()=>K(e,!1,"start")),h(t=>{if(a){if(t>=m)return f(0,1),K(e,!1,"end"),--u.r||l(u.c),!1;if(t>=g){const e=c((t-g)/n);f(1-e,e)}}return a})}return u.r+=1,c(i)?Z().then(()=>{i=i(),f()}):f(),{end(t){t&&i.tick&&i.tick(1,0),a&&(s&&q(e,s),a=!1)}}}(n,ve,{y:-50,duration:200}),g=!1},d(e){e&&b(n),e&&p&&p.end(),S()}}}function $e(e){let t,n,o,r,s,i,c,a,u,d,f,p,g,h=e[1]?"Hide":"Show",S=[],_=new Map,C=e[1]&&xe(e),E=e[0];const P=e=>e[12].text;for(let t=0;t<E.length;t+=1){let n=be(e,E,t),o=P(n);_.set(o,S[t]=ye(o,n))}return{c(){t=x("div"),n=x("h1"),n.textContent="VRV Subtitler",o=$(),r=x("button"),s=y(h),i=y(" Settings"),c=$(),C&&C.c(),a=$(),u=x("h2"),u.textContent="Recent Subtitles",d=$(),f=x("ul");for(let e=0;e<S.length;e+=1)S[e].c();k(n,"class","svelte-1jgx8ip"),k(r,"class","svelte-1jgx8ip"),k(u,"class","svelte-1jgx8ip"),k(f,"class","recent-subs svelte-1jgx8ip"),k(t,"class","tray svelte-1jgx8ip")},m(l,h){v(l,t,h),m(t,n),m(t,o),m(t,r),m(r,s),m(r,i),m(t,c),C&&C.m(t,null),m(t,a),m(t,u),m(t,d),m(t,f);for(let e=0;e<S.length;e+=1)S[e].m(f,null);p=!0,g=[w(r,"click",e[7]),w(t,"mouseenter",e[4](!0)),w(t,"mouseleave",e[4](!1))]},p(e,[n]){if((!p||2&n)&&h!==(h=e[1]?"Hide":"Show")&&j(s,h),e[1]?C?C.p(e,n):(C=xe(e),C.c(),C.m(t,a)):C&&(C.d(1),C=null),9&n){const t=e[0];X(),S=function(e,t,n,o,r,s,i,l,c,a,u,d){let f=e.length,p=s.length,g=f;const h={};for(;g--;)h[e[g].key]=g;const m=[],v=new Map,b=new Map;for(g=p;g--;){const e=d(r,s,g),l=n(e);let c=i.get(l);c?o&&c.p(e,t):(c=a(l,e),c.c()),v.set(l,m[g]=c),l in h&&b.set(l,Math.abs(g-h[l]))}const x=new Set,y=new Set;function $(e){te(e,1),e.m(l,u),i.set(e.key,e),u=e.first,p--}for(;f&&p;){const t=m[p-1],n=e[f-1],o=t.key,r=n.key;t===n?(u=t.first,f--,p--):v.has(r)?!i.has(o)||x.has(o)?$(t):y.has(r)?f--:b.get(o)>b.get(r)?(y.add(o),$(t)):(x.add(r),f--):(c(n,i),f--)}for(;f--;){const t=e[f];v.has(t.key)||c(t,i)}for(;p;)$(m[p-1]);return m}(S,n,P,1,e,t,_,f,se,ye,null,be),ee()}},i(e){if(!p){for(let e=0;e<E.length;e+=1)te(S[e]);p=!0}},o(e){for(let e=0;e<S.length;e+=1)ne(S[e]);p=!1},d(e){e&&b(t),C&&C.d();for(let e=0;e<S.length;e+=1)S[e].d();l(g)}}}function we(e,t,n){const o=A();let{recentSubs:r=[]}=t,s=!1,i=!0;return e.$set=e=>{"recentSubs"in e&&n(0,r=e.recentSubs)},[r,s,i,o,function(e){return()=>{e&&!i||o("tray-pauser",e)}},function(e){return t=>{o(e,t.target.checked)}},!0,()=>n(1,s=!s),()=>o("restart"),()=>o("realign"),function(){i=this.checked,n(2,i)},()=>o("define-pauser")]}var ke=class extends de{constructor(e){var t;super(),document.getElementById("svelte-1jgx8ip-style")||((t=x("style")).id="svelte-1jgx8ip-style",t.textContent=".tray.svelte-1jgx8ip.svelte-1jgx8ip{margin-top:0.5rem;width:2vw;background:rgba(33, 39, 55, 0.2);position:fixed;right:0;top:0;color:white;height:calc(100% - 5rem)}.tray.svelte-1jgx8ip>.svelte-1jgx8ip{visibility:hidden}.tray.svelte-1jgx8ip.svelte-1jgx8ip:hover{width:40vw;max-width:40rem;background:rgb(33, 39, 55);overflow:auto;border-radius:3px}.tray.svelte-1jgx8ip:hover>.svelte-1jgx8ip{visibility:visible}.tray.svelte-1jgx8ip h1.svelte-1jgx8ip{font-size:2rem;background:rgb(27, 26, 38);padding:0.5rem 0;border-radius:3px;margin:0 0 0.5rem 0;border-bottom:2px solid #f47521}.tray.svelte-1jgx8ip h2.svelte-1jgx8ip{margin:0;text-decoration:underline}button.svelte-1jgx8ip.svelte-1jgx8ip{margin:0.5rem}.settings.svelte-1jgx8ip.svelte-1jgx8ip{background:#1a1d2b;margin:1rem;padding:1rem;box-shadow:inset 0 0 0.5rem black;border-radius:3px}ul.svelte-1jgx8ip.svelte-1jgx8ip{list-style:none}a.svelte-1jgx8ip.svelte-1jgx8ip{color:white;transform:scaleY(0);transform-origin:top;transition:transform 0.5s ease;font-size:1rem;text-decoration:none}a.svelte-1jgx8ip.svelte-1jgx8ip:hover{color:#0aff8c;cursor:pointer;text-decoration:underline}li.svelte-1jgx8ip.svelte-1jgx8ip:not(:first-of-type)::before{content:' ';position:relative;background:#f47521;height:0.1rem;width:3.2rem;display:block;margin:0 auto;border-radius:4px}",m(document.head,t)),ue(this,e,we,$e,a,{recentSubs:0})}};function je(e,t,n){const o=e.slice();return o[5]=t[n],o}function Se(e){let t,n=e[0],o=[];for(let t=0;t<n.length;t+=1)o[t]=_e(je(e,n,t));return{c(){for(let e=0;e<o.length;e+=1)o[e].c();t=y("")},m(e,n){for(let t=0;t<o.length;t+=1)o[t].m(e,n);v(e,t,n)},p(e,r){if(5&r){let s;for(n=e[0],s=0;s<n.length;s+=1){const i=je(e,n,s);o[s]?o[s].p(i,r):(o[s]=_e(i),o[s].c(),o[s].m(t.parentNode,t))}for(;s<o.length;s+=1)o[s].d(1);o.length=n.length}},d(e){!function(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}(o,e),e&&b(t)}}}function _e(e){let t,n,o,r=e[5].text+"";function s(...t){return e[4](e[5],...t)}return{c(){t=x("p"),n=y(r),S(t,"font-size",.5+2.5*e[5].line+"rem"),k(t,"title","click to search this phrase on Jisho.org"),k(t,"class","svelte-1n7ymnp")},m(e,r){v(e,t,r),m(t,n),o=w(t,"click",s)},p(o,s){e=o,1&s&&r!==(r=e[5].text+"")&&j(n,r),1&s&&S(t,"font-size",.5+2.5*e[5].line+"rem")},d(e){e&&b(t),o()}}}function Ce(e){let t,n=e[1]&&Se(e);return{c(){t=x("div"),n&&n.c(),k(t,"class","subtitles")},m(e,o){v(e,t,o),n&&n.m(t,null)},p(e,[o]){e[1]?n?n.p(e,o):(n=Se(e),n.c(),n.m(t,null)):n&&(n.d(1),n=null)},i:o,o:o,d(e){e&&b(t),n&&n.d()}}}function Ee(e,t,n){let{current:o=[]}=t,{visible:r=!0}=t;const s=A();function i(e){s("define-pauser"),window.open(`https://jisho.org/search/${encodeURIComponent(e.trim())}`)}return e.$set=e=>{"current"in e&&n(0,o=e.current),"visible"in e&&n(1,r=e.visible)},[o,r,i,s,e=>i(e.text)]}var Pe=class extends de{constructor(e){var t;super(),document.getElementById("svelte-1n7ymnp-style")||((t=x("style")).id="svelte-1n7ymnp-style",t.textContent="p.svelte-1n7ymnp{cursor:pointer;color:white;margin:0;padding:0;text-shadow:black 2px 2px 0, black 2px -2px 0, black -2px 2px 0, black -2px -2px 0, black 2px 0 0, black 0 2px 0, black -2px 0 0, black 0 -2px 0, black 2px 2px 2px}p.svelte-1n7ymnp:hover{color:#0aff8c}",m(document.head,t)),ue(this,e,Ee,Ce,a,{current:0,visible:1})}};class Me{constructor(){this.video=null,this.reasons=[]}setVideo(e){this.reasons=[],this.video=e}addPauser(e){this.reasons.push(e),this._checkPause()}removePauser(e){const t=this.reasons.indexOf(e);-1!==t&&(this.reasons.splice(t,1),this._checkPause())}_checkPause(){this.reasons.length?this.video.pause():this.video.play()}}const{document:Re}=re;function qe(e){let t,n;const o=new Pe({props:{current:e[1],currentTime:e[6],visible:e[4]}});o.$on("define-pauser",e[12]);const r=new ke({props:{recentSubs:e[3]}});return r.$on("restart",e[7]),r.$on("tray-pauser",e[11]),r.$on("define-pauser",e[12]),r.$on("realign",e[19]),r.$on("show-subs",e[20]),{c(){le(o.$$.fragment),t=$(),le(r.$$.fragment)},m(e,s){ce(o,e,s),v(e,t,s),ce(r,e,s),n=!0},p(e,t){const n={};2&t&&(n.current=e[1]),16&t&&(n.visible=e[4]),o.$set(n);const s={};8&t&&(s.recentSubs=e[3]),r.$set(s)},i(e){n||(te(o.$$.fragment,e),te(r.$$.fragment,e),n=!0)},o(e){ne(o.$$.fragment,e),ne(r.$$.fragment,e),n=!1},d(e){ae(o,e),e&&b(t),ae(r,e)}}}function Oe(e){let t,n,r,s,i,l,c,a,u,d=e[2].subs[0].text+"",f="number"==typeof e[5]&&function(e){let t,n;return{c(){t=x("button"),t.textContent=`\n\t\t\t\t\tUse the last alignment (first line at ${(e[5]/1e3).toFixed(1)} seconds).\n\t\t\t\t`,k(t,"class","svelte-gi9goe")},m(o,r){v(o,t,r),n=w(t,"click",e[9])},p:o,d(e){e&&b(t),n()}}}(e);return{c(){t=x("div"),n=x("button"),r=y("Click when the first line is said:\n\t\t\t\t"),s=x("br"),i=$(),l=x("pre"),c=y(d),a=$(),f&&f.c(),k(n,"class","svelte-gi9goe"),k(t,"class","alignment-buttons svelte-gi9goe")},m(o,d){v(o,t,d),m(t,n),m(n,r),m(n,s),m(n,i),m(n,l),m(l,c),m(t,a),f&&f.m(t,null),u=w(n,"click",e[8])},p(e,t){4&t&&d!==(d=e[2].subs[0].text+"")&&j(c,d),"number"==typeof e[5]&&f.p(e,t)},i:o,o:o,d(e){e&&b(t),f&&f.d(),u()}}}function Te(e){let t;const n=new he({});return n.$on("srt-loaded",e[10]),{c(){le(n.$$.fragment)},m(e,o){ce(n,e,o),t=!0},p:o,i(e){t||(te(n.$$.fragment,e),t=!0)},o(e){ne(n.$$.fragment,e),t=!1},d(e){ae(n,e)}}}function Ae(e){let t,n,o,r;const s=[Te,Oe,qe],i=[];function l(e,t){return"prompt"===e[0]?0:"align"===e[0]?1:"play"===e[0]?2:-1}return~(n=l(e))&&(o=i[n]=s[n](e)),{c(){t=x("div"),o&&o.c(),k(t,"class","subtitles-app svelte-gi9goe")},m(e,o){v(e,t,o),~n&&i[n].m(t,null),r=!0},p(e,[r]){let c=n;n=l(e),n===c?~n&&i[n].p(e,r):(o&&(X(),ne(i[c],1,1,()=>{i[c]=null}),ee()),~n?(o=i[n],o||(o=i[n]=s[n](e),o.c()),te(o,1),o.m(t,null)):o=null)},i(e){r||(te(o),r=!0)},o(e){ne(o),r=!1},d(e){e&&b(t),~n&&i[n].d()}}}function Ie(e,t,n){const o=GM_getValue("last-used-alignment"),r=new Me;let s="prompt",i=[],l=null,c=null,a=-1,u=[],d=!0;function f(){n(0,s="prompt"),n(2,l=null),n(1,i=[])}var p;function g(e){c=document.querySelector("video"),r.setVideo(c),a="number"==typeof e?e:1e3*c.currentTime-l.subs[0].start-400,GM_setValue("last-used-alignment",a),n(3,u=[]),n(0,s="play"),m()}function h(e){let t=e[e.length-1],o=u[u.length-1];!t||o&&t.text===o.text||n(3,u=[...u,t]),u.length>10&&n(3,u=u.slice(u.length-10))}function m(){"play"===s&&(n(1,i=l.getSubs(1e3*c.currentTime-a)),h(i),requestAnimationFrame(m))}p=()=>{document.addEventListener("visibilitychange",()=>{document.hidden||r.removePauser("define")});let e="";setInterval(()=>{const t=document.querySelector("video").getAttribute("src");t&&t!==e&&(e=t,f())},50)},T().$$.on_mount.push(p);return[s,i,l,u,d,o,"",f,g,function(){g(o)},function(e){n(2,l=new fe(e.detail)),0===l.subs.length?alert("No subtitles were parsed from the selected SRT file, verify nothing is wrong with the file. If it appears normal please submit a bug report with the episode and the SRT file you used to the issue tracker!"):n(0,s="align")},function(e){e.detail?r.addPauser("tray"):r.removePauser("tray")},function(){r.addPauser("define")},c,a,"last-used-alignment",r,h,m,()=>n(0,s="align"),e=>n(4,d=e.detail)]}var ze=class extends de{constructor(e){var t;super(),Re.getElementById("svelte-gi9goe-style")||((t=x("style")).id="svelte-gi9goe-style",t.textContent=".subtitles-app.svelte-gi9goe.svelte-gi9goe{position:relative}.subtitles-app.svelte-gi9goe.svelte-gi9goe>*{z-index:1000000000}.subtitles-app.svelte-gi9goe.svelte-gi9goe button{background:#fd0;border:none;cursor:pointer;padding:10px;line-height:1;font-weight:bold;color:black;text-transform:uppercase}.subtitles-app.svelte-gi9goe.svelte-gi9goe button:hover{background:#ffea6d}.alignment-buttons.svelte-gi9goe.svelte-gi9goe{display:flex;flex-direction:column}.alignment-buttons.svelte-gi9goe button.svelte-gi9goe{margin:0.5rem;align-self:center}",m(Re.head,t)),ue(this,e,Ie,Ae,a,{})}};const Ve=document.createElement("div");document.body.appendChild(Ve),Ve.id="sheodox-vrv-subtitler",Ve.style.height="100%",Ve.style.width="100%";new ze({target:Ve})}]);