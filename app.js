const $=id=>document.getElementById(id),LS=localStorage;
let N=+LS.kn_size||8,b,path,hintCell=-1,over=false;
const opt=k=>LS["kn_"+k]!=="0";
window.haptic=t=>{try{const H=window.TG&&TG.HapticFeedback;if(!H)return;t==="err"?H.notificationOccurred("error"):t==="win"?H.notificationOccurred("success"):t==="sel"?H.selectionChanged():H.impactOccurred("light")}catch(e){}};
const vib=t=>{haptic(t);try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}};
// theme
const sysDark=()=>window.TG?TG.colorScheme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;
function applyTheme(){const m=LS.kn_theme,t=m==="day"||m==="night"?m:(sysDark()?"night":"day");document.documentElement.dataset.theme=t;
 const c=getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();$("tc").content=c;
 try{if(window.TG){TG.setHeaderColor(c);TG.setBackgroundColor(c)}}catch(e){}
 document.querySelectorAll("#thSeg button").forEach(x=>x.classList.toggle("on",x.dataset.t===(m==="day"||m==="night"?m:"auto")))}
$("theme").onclick=()=>{vib();LS.kn_theme=document.documentElement.dataset.theme==="night"?"day":"night";applyTheme()};
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",applyTheme);
if(window.TG)TG.onEvent("themeChanged",applyTheme);
// timer
let t0=0,acc=0,running=false,tick=null;
const fmt=ms=>{const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
const elapsed=()=>acc+(running?Date.now()-t0:0);
function tStart(){if(!running){t0=Date.now();running=true;tick=setInterval(showT,500)}}
function tStop(){if(running){acc+=Date.now()-t0;running=false;clearInterval(tick)}showT()}
function tReset(){tStop();acc=0;showT()}
function showT(){$("time").textContent=fmt(elapsed())}
document.addEventListener("visibilitychange",()=>{if(document.hidden){if(running){tStop();window._paused=1}}else if(window._paused){window._paused=0;if(!over&&path.length)tStart()}});
// game
const bestKey=()=>"kn_best_"+N,btKey=()=>"kn_bt_"+N;
function reset(){b=new Array(N*N).fill(0);path=[];hintCell=-1;over=false;tReset();render()}
function tap(i){if(over)return;const cur=path[path.length-1];
 if(path.length&&!KL.moves(N,b,cur).includes(i)){const e=$("board").children[i];e.classList.remove("shake");void e.offsetWidth;e.classList.add("shake");haptic("err");return}
 path.push(i);b[i]=path.length;hintCell=-1;if(path.length===1)tStart();vib();render()}
function render(){const B=$("board");B.style.gridTemplateColumns=B.style.gridTemplateRows=`repeat(${N},minmax(0,1fr))`;B.innerHTML="";
 const cur=path[path.length-1],mv=path.length?KL.moves(N,b,cur):[];
 for(let i=0;i<N*N;i++){const e=document.createElement("button");const r=Math.floor(i/N),c=i%N;
  e.className="c "+((r+c)%2?"d":"l");if(b[i]){const s=document.createElement("span");s.textContent=b[i];e.appendChild(s)}
  if(i===cur)e.classList.add("cur");if(mv.includes(i))e.classList.add("m");if(i===hintCell)e.classList.add("h");
  e.style.fontSize=N==8?"":N==6?"19px":"22px";e.onclick=()=>tap(i);B.appendChild(e)}
 const sv=$("trail");sv.setAttribute("viewBox",`0 0 ${N} ${N}`);sv.setAttribute("preserveAspectRatio","none");
 sv.innerHTML=path.length>1?`<polyline vector-effect="non-scaling-stroke" points="${path.map(i=>(i%N+.5)+","+(Math.floor(i/N)+.5)).join(" ")}"/>`:"";
 const T=N*N,s=path.length;let best=+LS[bestKey()]||0;if(s>best){best=s;LS[bestKey()]=s}
 $("score").textContent=s;$("total").textContent="/"+T;$("best").textContent=best;$("sizeLbl").textContent=N+"×"+N;
 $("undo").disabled=!s;$("hint").disabled=!s||!mv.length;const m=$("msg");
 if(s===T){if(!over){over=true;tStop();const el=elapsed(),bt=+LS[btKey()]||0;if(opt("timer")&&(!bt||el<bt))LS[btKey()]=el;haptic("win")}
  const bt=+LS[btKey()]||0;m.innerHTML="Обход завершён. Конь побывал на всех <b>"+T+"</b> полях"+(opt("timer")?" за <b>"+fmt(elapsed())+"</b>"+(bt?", лучшее время "+fmt(bt):""):"")+".";
  m.classList.remove("hidden");$("status").textContent="Победа"}
 else if(s&&!mv.length){if(!over){over=true;tStop();haptic("err")}m.innerHTML="Конь в тупике. Счёт <b>"+s+"/"+T+"</b>, рекорд "+best+".";m.classList.remove("hidden");$("status").textContent="Ходов больше нет"}
 else{over=false;if(s&&!running&&!document.hidden)tStart();m.classList.add("hidden");$("status").textContent=s?"Ход "+(s+1)+" · вариантов: "+mv.length:"Поставьте коня на любое поле"}
 document.querySelectorAll("#seg button").forEach(x=>x.classList.toggle("on",+x.dataset.n===N))}
$("undo").onclick=()=>{if(!path.length)return;b[path.pop()]=0;hintCell=-1;vib();if(!path.length)tReset();render()};
$("reset").onclick=()=>{vib();reset()};
$("hint").onclick=()=>{hintCell=KL.hint(N,b,path[path.length-1]);vib();render()};
// settings
function applyOpts(){document.body.classList.toggle("noTrail",!opt("trail"));document.body.classList.toggle("noTimer",!opt("timer"));document.body.classList.toggle("noHints",!opt("hints"));
 document.querySelectorAll(".sw").forEach(x=>x.classList.toggle("on",opt(x.dataset.k)));
 $("bestTimes").textContent="Лучшее время: "+[5,6,8].map(n=>n+"×"+n+" — "+(LS["kn_bt_"+n]?fmt(+LS["kn_bt_"+n]):"нет")).join(" · ")}
document.querySelectorAll(".sw").forEach(x=>x.onclick=()=>{LS["kn_"+x.dataset.k]=opt(x.dataset.k)?"0":"1";haptic("sel");applyOpts()});
document.querySelectorAll("#seg button").forEach(x=>x.onclick=()=>{if(+x.dataset.n===N)return;N=+x.dataset.n;LS.kn_size=N;haptic("sel");reset()});
document.querySelectorAll("#thSeg button").forEach(x=>x.onclick=()=>{x.dataset.t==="auto"?LS.removeItem("kn_theme"):LS.kn_theme=x.dataset.t;haptic("sel");applyTheme()});
const openS=o=>{$("sheet").classList.toggle("on",o);$("sheetBg").classList.toggle("on",o);$("sheet").setAttribute("aria-hidden",!o);if(o)applyOpts();vib()};
$("gear").onclick=()=>openS(true);$("done").onclick=$("sheetBg").onclick=()=>openS(false);
document.addEventListener("gesturestart",e=>e.preventDefault());
if("serviceWorker"in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("sw.js");
applyTheme();applyOpts();reset();
