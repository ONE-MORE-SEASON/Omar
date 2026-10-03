/* ONE MORE SEASON — UPDATE 2: CAREER DASHBOARD
   This module is intentionally dependency-free and only activates when loaded.
   No 3D, no minigames. It adds a premium simulation dashboard with objectives,
   form, fitness, morale, market interest, next-event cards and a compact feed. */
(() => {
  'use strict';
  if (window.__OMS_UPDATE2__) return;
  window.__OMS_UPDATE2__ = true;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const state = () => window.state || null;
  const day = () => Math.max(1, Number(state()?.day || document.querySelector('#day')?.textContent || 1));
  const player = () => state()?.name || document.querySelector('#name')?.value || 'Your Player';
  const value = (key, fallback) => Math.max(0, Math.min(100, Number(state()?.[key] ?? fallback)));
  const styles = () => {
    if (document.getElementById('oms2Styles')) return;
    const s=document.createElement('style'); s.id='oms2Styles';
    s.textContent=`
      #oms2Dashboard{margin-top:18px;display:grid;grid-template-columns:1.25fr .75fr;gap:14px}
      .oms2Panel{border:1px solid #1d5579;border-radius:18px;background:linear-gradient(145deg,#091e30f7,#05121ef7);padding:18px;box-shadow:0 14px 40px #0006}
      .oms2Kicker{font-size:9px;letter-spacing:1.7px;font-weight:950;color:#79d0ff}.oms2Title{font-size:19px;font-weight:950;margin-top:4px}
      .oms2Stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:13px}.oms2Stat{padding:11px;border:1px solid #194963;border-radius:12px;background:#061724}.oms2Stat small{color:#8faec7}.oms2Stat b{display:block;font-size:20px;margin-top:3px}
      .oms2Bar{height:6px;background:#07131e;border-radius:99px;overflow:hidden;margin-top:7px}.oms2Bar i{display:block;height:100%;background:linear-gradient(90deg,#18d79b,#4bb7ff)}
      .oms2List{display:grid;gap:7px;margin-top:11px}.oms2Item{padding:11px;border:1px solid #19455f;border-radius:11px;background:#061722}.oms2Item b{font-size:11px}.oms2Item p{margin:4px 0 0;color:#9db6c9;font-size:11px;line-height:1.35}
      .oms2Badge{float:right;border:1px solid #255a7d;border-radius:99px;padding:3px 6px;color:#9ed7ff;font-size:8px;font-weight:900}
      .oms2Objective{padding:10px;border:1px solid #194963;border-radius:11px;background:#071a2a;margin-top:8px}.oms2Objective b{font-size:11px}.oms2Objective small{display:block;color:#8faec7;margin-top:3px}
      @media(max-width:900px){#oms2Dashboard{grid-template-columns:1fr}.oms2Stats{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:500px){.oms2Stats{grid-template-columns:1fr 1fr}}
    `; document.head.appendChild(s);
  };
  function render(){
    const home=document.querySelector('#home'); if(!home || !state()?.started && !state()?.name) return;
    styles(); let d=document.getElementById('oms2Dashboard');
    if(!d){d=document.createElement('section');d.id='oms2Dashboard';const anchor=home.querySelector('.layout');(anchor||home).insertAdjacentElement(anchor?'afterend':'beforeend',d)}
    const form=value('form',68), fitness=value('fitness',92), morale=value('morale',78), sharp=value('sharp',85);
    const interest=Math.min(100,Math.round((form+morale+sharp)/3));
    const events=[
      ['NEXT STEP','Keep your form high to increase selection chances.','CAREER'],
      ['TRAINING','Fitness and sharpness will change as you simulate days.','TRAINING'],
      ['MARKET','Strong performances can increase outside interest.','TRANSFER']
    ];
    const objectives=[
      ['CONSISTENCY','Maintain form above 70',form],
      ['FITNESS','Keep fitness above 65',fitness],
      ['SQUAD ROLE','Build manager trust',Math.round((form+morale)/2)]
    ];
    d.innerHTML=`<section class="oms2Panel"><div class="oms2Kicker">ONE MORE SEASON · CAREER INTELLIGENCE</div><div class="oms2Title">${esc(player())}'s Dashboard</div><div class="oms2Stats">
      <div class="oms2Stat"><small>FORM</small><b>${form}</b><div class="oms2Bar"><i style="width:${form}%"></i></div></div>
      <div class="oms2Stat"><small>FITNESS</small><b>${fitness}</b><div class="oms2Bar"><i style="width:${fitness}%"></i></div></div>
      <div class="oms2Stat"><small>MORALE</small><b>${morale}</b><div class="oms2Bar"><i style="width:${morale}%"></i></div></div>
      <div class="oms2Stat"><small>SHARPNESS</small><b>${sharp}</b><div class="oms2Bar"><i style="width:${sharp}%"></i></div></div></div>
      <div class="oms2Kicker" style="margin-top:16px">CAREER OBJECTIVES</div><div class="oms2List">${objectives.map(o=>`<div class="oms2Objective"><b>${esc(o[0])}</b><small>${esc(o[1])}</small><div class="oms2Bar"><i style="width:${o[2]}%"></i></div></div>`).join('')}</div></section>
      <section class="oms2Panel"><div class="oms2Kicker">DAY ${day()} · SIMULATION FEED</div><div class="oms2Title">What matters now</div><div class="oms2List">${events.map(e=>`<article class="oms2Item"><span class="oms2Badge">${e[2]}</span><b>${esc(e[0])}</b><p>${esc(e[1])}</p></article>`).join('')}</div><div class="oms2Kicker" style="margin-top:15px">MARKET INTEREST</div><div class="oms2Item"><b>${interest}%</b><p>Current simulated interest based on your recent profile.</p><div class="oms2Bar"><i style="width:${interest}%"></i></div></div></section>`;
  }
  window.OMSUpdate2={render};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',render,{once:true}); else render();
})();