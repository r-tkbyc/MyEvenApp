(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))l(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&l(r)}).observe(document,{childList:!0,subtree:!0});function s(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function l(o){if(o.ep)return;o.ep=!0;const n=s(o);fetch(o.href,n)}})();const h="modulepreload",w=function(e,t){return new URL(e,t).href},b={},E=function(t,s,l){let o=Promise.resolve();if(s&&s.length>0){let g=function(i){return Promise.all(i.map(d=>Promise.resolve(d).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};const r=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),y=c?.nonce||c?.getAttribute("nonce");o=g(s.map(i=>{if(i=w(i,l),i in b)return;b[i]=!0;const d=i.endsWith(".css"),u=d?'[rel="stylesheet"]':"";if(l)for(let f=r.length-1;f>=0;f--){const p=r[f];if(p.href===i&&(!d||p.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${i}"]${u}`))return;const a=document.createElement("link");if(a.rel=d?"stylesheet":h,d||(a.as="script"),a.crossOrigin="",a.href=i,y&&a.setAttribute("nonce",y),document.head.appendChild(a),d)return new Promise((f,p)=>{a.addEventListener("load",f),a.addEventListener("error",()=>p(new Error(`Unable to preload CSS for ${i}`)))})}))}function n(r){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=r,window.dispatchEvent(c),!c.defaultPrevented)throw r}return o.then(r=>{for(const c of r||[])c.status==="rejected"&&n(c.reason);return t().catch(n)})},m={tap:0,doubleTap:0,swipeUp:0,swipeDown:0,total:0};let L=null;function B(e){L=e}function S(){const e=document.getElementById("app");if(!e)return;const t=document.createElement("div");t.id="counters",t.innerHTML=`
    <div class="counter-box" style="border-color:#ff0">
      <div class="count" id="c-tap">0</div>
      <div class="label">Tap</div>
    </div>
    <div class="counter-box" style="border-color:#f80">
      <div class="count" id="c-double">0</div>
      <div class="label">Double Tap</div>
    </div>
    <div class="counter-box" style="border-color:#0ff">
      <div class="count" id="c-up">0</div>
      <div class="label">Swipe Up</div>
    </div>
    <div class="counter-box" style="border-color:#0af">
      <div class="count" id="c-down">0</div>
      <div class="label">Swipe Down</div>
    </div>
  `;const s=document.getElementById("event-log");s?e.insertBefore(t,s):e.appendChild(t)}function C(){const e=(t,s)=>{const l=document.getElementById(t);l&&(l.textContent=String(s))};e("c-tap",m.tap),e("c-double",m.doubleTap),e("c-up",m.swipeUp),e("c-down",m.swipeDown)}function v(e){console.log(`[ui] ${e}`);const t=document.getElementById("status");t&&(t.textContent=e)}async function P(){v("Loading...");const e=await E(()=>import("./index-BFd0K6P2.js"),[],import.meta.url),t=e.app??e.default;document.title=`${t.name} – Even G2`,v(t.initialStatus??`${t.name} ready`),S(),await(await t.createActions(v)).connect()}P().catch(e=>{console.error("[app-loader] boot failed",e);const t=document.getElementById("status");t&&(t.textContent=`Boot failed: ${e instanceof Error?e.message:String(e)}`)});export{L as b,m as c,B as s,C as u};
