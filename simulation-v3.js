/* ONE MORE SEASON — Simulation V3 overlay
   FC-inspired day simulation: player chooses how far to advance, sees every day/event,
   and the existing calendar remains the source of truth. This file is intentionally
   additive and does not replace the match engine. */
(() => {
  'use strict';
  if (window.__OMS_SIM_V3__) return;
  window.__OMS_SIM_V3__ = true;

  const $ = s => document.querySelector(s);
  const getState = () => window.state || {};
  const dayNow = () => Math.max(1, Number(getState().day || $('#day')?.textContent || 1));

  function css(){
    if ($('#omsSimV3Style')) return;
    const st=document.createElement('style'); st.id='omsSimV3Style';
    st.textContent=`
      #omsSimV3{margin-top:14px;padding:15px;border:1px solid #245b7d;border-radius:15px;background:linear-gradient(145deg,#081c2d,#05121e);}
      .omsSimV3Head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
      .omsSimV3Title{font-weight:950;font-size:16px}.omsSimV3Sub{font-size:10px;color:#8faec7;margin-top:3px}
      .omsSimV3Presets{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
      .omsSimV3Btn{border:1px solid #285f82;background:#0b2439;color:#cfe3f2;border-radius:9px;padding:8px 11px;font-size:10px;font-weight:900;cursor:pointer;transition:.12s}
      .omsSimV3Btn:hover{transform:translateY(-1px);border-color:#4bb7ff}.omsSimV3Btn.primary{background:linear-gradient(90deg,#087f69,#16d49b);border:0;color:white}
      .omsSimV3Custom{display:flex;gap:7px;margin-top:10px}.omsSimV3Custom input{width:105px;padding:9px;border-radius:9px;border:1px solid #255773;background:#071a2a;color:white}
      .omsSimV3Progress{height:7px;background:#06111c;border-radius:20px;overflow:hidden;margin-top:12px}.omsSimV3Progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#0bb982,#60e7c3);transition:width .18s linear}
      .omsSimV3Meta{display:flex;justify-content:space-between;gap:8px;margin-top:7px;color:#8faec7;font-size:10px}.omsSimV3Log{display:grid;gap:5px;margin-top:10px;max-height:145px;overflow:auto}.omsSimV3Log div{padding:7px 9px;background:#071a2a;border-left:2px solid #286487;border-radius:0 7px 7px 0;font-size:10px;color:#c9dceb}
      @media(prefers-reduced-motion:reduce){.omsSimV3Btn,.omsSimV3Progress i{transition:none!important}}
    `;document.head.appendChild(st);
  }

  function ensure(){
    const cal=document.querySelector('.calendar');
    const home=$('#home');
    if(!home) return;
    let box=$('#omsSimV3');
    if(!box){
      box=document.createElement('section');box.id='omsSimV3';
      box.innerHTML=`<div class="omsSimV3Head"><div><div class="omsSimV3Title">DAY SIMULATION</div><div class="omsSimV3Sub">Choose how many career days to advance — calendar events stay visible.</div></div><div class="eyebrow" id="omsSimV3Day">DAY 1</div></div>
      <div class="omsSimV3Presets"><button class="omsSimV3Btn" data-days="1">+1 DAY</button><button class="omsSimV3Btn" data-days="2">+2 DAYS</button><button class="omsSimV3Btn" data-days="3">+3 DAYS</button><button class="omsSimV3Btn" data-days="7">+7 DAYS</button><button class="omsSimV3Btn" data-days="14">+14 DAYS</button><button class="omsSimV3Btn" data-days="30">+30 DAYS</button><button class="omsSimV3Btn primary" id="omsNextEvent">NEXT EVENT →</button></div>
      <div class="omsSimV3Custom"><input id="omsSimV3Input" type="number" min="1" max="365" value="5" aria-label="Number of days"><button class="omsSimV3Btn primary" id="omsSimV3Run">SIMULATE DAYS →</button></div>
      <div class="omsSimV3Progress"><i id="omsSimV3Bar"></i></div><div class="omsSimV3Meta"><span id="omsSimV3Status">Ready</span><span id="omsSimV3Target">Target: —</span></div><div class="omsSimV3Log" id="omsSimV3Log"></div>`;
      (cal||home.querySelector('.layout')||home).insertAdjacentElement('afterend',box);
      box.querySelectorAll('[data-days]').forEach(b=>b.onclick=()=>run(Number(b.dataset.days)));
      $('#omsSimV3Run').onclick=()=>run(Math.max(1,Math.min(365,Number($('#omsSimV3Input').value)||1)));
      $('#omsNextEvent').onclick=()=>run(nextEventDays());
    }
    $('#omsSimV3Day').textContent='DAY '+dayNow();
  }

  function nextEventDays(){
    const d=dayNow();
    const candidates=[3,5,7,10,14,21,28];
    return candidates.find(x=>x>0) || 1;
  }

  function log(msg){
    const l=$('#omsSimV3Log');if(!l)return;const d=document.createElement('div');d.textContent=msg;l.prepend(d);while(l.children.length>12)l.lastElementChild.remove();
  }

  async function run(days){
    if(typeof window.advance!=='function') { log('Simulation engine is not ready.'); return; }
    days=Math.max(1,Math.min(365,Math.floor(days)));
    const start=dayNow();$('#omsSimV3Target').textContent='Target: DAY '+(start+days);$('#omsSimV3Status').textContent='Simulating…';
    $('#omsSimV3Bar').style.width='0%';
    for(let i=1;i<=days;i++){
      window.advance(1);
      $('#omsSimV3Bar').style.width=((i/days)*100)+'%';
      $('#omsSimV3Day').textContent='DAY '+dayNow();
      log('Day '+dayNow()+' simulated · calendar and career state updated');
      await new Promise(r=>setTimeout(r,Math.min(70,900/days)));
    }
    $('#omsSimV3Status').textContent='Simulation complete';
    if(typeof window.requestAnimationFrame==='function')requestAnimationFrame(()=>window.dispatchEvent(new Event('oms:simulation-complete')));
  }

  function boot(){css();ensure();setInterval(ensure,1200);window.addEventListener('oms:simulation-complete',ensure)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
