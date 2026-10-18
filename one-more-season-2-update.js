/* ONE MORE SEASON — UPDATE 2: CAREER DASHBOARD
   FC-style player-career day simulation and calendar controls.
   No 3D, no minigames. Keeps existing career data and match simulator. */
(() => {
  'use strict';
  if (window.__OMS_UPDATE2__) return;
  window.__OMS_UPDATE2__ = true;

  const esc = s => String(s ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
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
      #oms2DaySimulator{margin-top:14px;padding:16px;border:1px solid #286487;border-radius:15px;background:linear-gradient(135deg,#071a2a,#061421);box-shadow:0 10px 30px #0004}
      .oms2DayHead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .oms2DayTitle{font-size:16px;font-weight:950}.oms2DaySub{font-size:10px;color:#8faec7;margin-top:3px}
      .oms2DayNow{padding:8px 11px;border:1px solid #1e5877;border-radius:10px;background:#071b2b;text-align:right}.oms2DayNow b{display:block;font-size:18px}.oms2DayNow small{color:#79d0ff;font-size:8px;letter-spacing:1.2px;font-weight:900}
      .oms2DayButtons{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}.oms2DayBtn{border:1px solid #285d7d;background:#0a2237;color:#d9e9f5;border-radius:9px;padding:9px 12px;font-size:10px;font-weight:950;min-width:58px}.oms2DayBtn:hover{border-color:#18d79b;background:#07352f}.oms2DayBtn:active{transform:scale(.97)}
      .oms2DayCustom{display:flex;gap:7px;margin-top:9px;align-items:center;flex-wrap:wrap}.oms2DayInput{width:100px;padding:9px 10px;border-radius:9px;border:1px solid #285d7d;background:#061724;color:#fff;font-weight:850;outline:none}.oms2DayInput:focus{border-color:#18d79b}.oms2DayGo{border:0;border-radius:9px;padding:9px 14px;background:linear-gradient(90deg,#087f69,#16d49b);color:#fff;font-weight:950;font-size:10px}
      .oms2DayHint{font-size:9px;color:#6f91aa;margin-top:8px}.oms2DayBtn[disabled],.oms2DayGo[disabled]{opacity:.45;cursor:not-allowed}
      .oms2SimStatus{margin-top:13px;border-top:1px solid #173c54;padding-top:12px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.oms2SimProgress{height:7px;background:#06121d;border-radius:99px;overflow:hidden}.oms2SimProgress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#18d79b,#4bb7ff);transition:width .3s ease}.oms2SimText{font-size:10px;color:#a9c5da}
      .oms2NextEvent{margin-top:11px;padding:11px;border:1px solid #1b4f6b;border-radius:11px;background:#061724}.oms2NextEvent b{font-size:11px}.oms2NextEvent span{float:right;color:#79d0ff;font-size:9px;font-weight:900}.oms2NextEvent small{display:block;color:#8faec7;margin-top:4px}
      #oms2DayLog{margin-top:10px;display:grid;gap:6px;max-height:150px;overflow:auto}.oms2Log{font-size:10px;color:#a9c5da;padding:7px 9px;background:#061723;border-radius:8px;border-left:2px solid #285d7d}.oms2Log strong{color:#fff}.oms2Log.match{border-left-color:#18d79b}.oms2Log.event{border-left-color:#ffd45a}
      @media(max-width:900px){#oms2Dashboard{grid-template-columns:1fr}.oms2Stats{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:500px){.oms2Stats{grid-template-columns:1fr 1fr}.oms2DayInput{width:85px}.oms2SimStatus{grid-template-columns:1fr}}
    `; document.head.appendChild(s);
  };

  function findCalendarPanel(){
    const home=document.querySelector('#home');
    if(!home) return null;
    return [...home.querySelectorAll('.panel')].find(p=>{
      const h=p.querySelector('h2')?.textContent.trim().toUpperCase();
      return h==='SEASON CALENDAR' || h==='PLAYER CALENDAR';
    });
  }

  function nextCalendarEvent(){
    const panel=findCalendarPanel();
    const events=panel ? [...panel.querySelectorAll('.event')] : [];
    const current=day();
    const future=events.map(e=>({el:e,text:e.textContent.replace(/\s+/g,' ').trim()})).filter(x=>x.text);
    const match=future.find(x=>/match|league|cup|champions|europa/i.test(x.text));
    return match ? {title:'NEXT MATCH',detail:match.text.slice(0,120)} : {title:'NEXT CAREER EVENT',detail:'Training, recovery or a career event is coming next.'};
  }

  function addDaySimulator(){
    const calendarPanel=findCalendarPanel();
    if(!calendarPanel) return;
    let box=document.getElementById('oms2DaySimulator');
    if(!box){
      box=document.createElement('div');
      box.id='oms2DaySimulator';
      const calendarGrid=calendarPanel.querySelector('.calendar');
      (calendarGrid||calendarPanel).insertAdjacentElement('afterend',box);
    }

    const current=day();
    const next=nextCalendarEvent();
    box.innerHTML=`
      <div class="oms2DayHead">
        <div><div class="oms2Kicker">FC-STYLE CAREER SIMULATION</div><div class="oms2DayTitle">Advance time</div><div class="oms2DaySub">Choose how far to move through your career. Matches and important events remain visible.</div></div>
        <div class="oms2DayNow"><small>CURRENT DAY</small><b>${current}</b></div>
      </div>
      <div class="oms2NextEvent"><span>${esc(next.title)}</span><b>${esc(next.detail.split(' · ')[0])}</b><small>${esc(next.detail)}</small></div>
      <div class="oms2DayButtons">
        <button class="oms2DayBtn" data-days="1">+1 DAY</button>
        <button class="oms2DayBtn" data-days="2">+2 DAYS</button>
        <button class="oms2DayBtn" data-days="3">+3 DAYS</button>
        <button class="oms2DayBtn" data-days="7">+7 DAYS</button>
        <button class="oms2DayBtn" data-days="14">+14 DAYS</button>
        <button class="oms2DayBtn" data-days="30">+30 DAYS</button>
      </div>
      <div class="oms2DayCustom"><span class="oms2DaySub">Custom days:</span><input class="oms2DayInput" id="oms2DayInput" type="number" min="1" max="365" value="5" aria-label="Number of days"><button class="oms2DayGo" id="oms2DayGo">SIMULATE DAYS →</button></div>
      <div class="oms2SimStatus"><div><div class="oms2SimProgress"><i id="oms2SimProgress"></i></div><div class="oms2DayHint" id="oms2SimText">Ready to simulate from Day ${current}.</div></div><div class="oms2DayHint">Stops are automatic at matches.</div></div>
      <div id="oms2DayLog"></div>`;

    const log=(text,type='')=>{
      const logBox=box.querySelector('#oms2DayLog');
      if(!logBox) return;
      const row=document.createElement('div'); row.className='oms2Log '+type; row.innerHTML=text; logBox.prepend(row);
      while(logBox.children.length>8) logBox.lastElementChild.remove();
    };

    const run=async n=>{
      n=Math.max(1,Math.min(365,Math.floor(Number(n)||0)));
      if(!n) return;
      const fn=window.advance;
      if(typeof fn!=='function') return;
      const buttons=[...box.querySelectorAll('.oms2DayBtn'),box.querySelector('#oms2DayGo')].filter(Boolean);
      buttons.forEach(b=>b.disabled=true);
      const input=box.querySelector('#oms2DayInput'); if(input) input.disabled=true;
      const progress=box.querySelector('#oms2SimProgress'), text=box.querySelector('#oms2SimText');
      log(`<strong>SIMULATION</strong> Starting ${n} day${n===1?'':'s'} from Day ${current}.`);
      for(let i=1;i<=n;i++){
        fn(1);
        if(progress) progress.style.width=Math.round(i/n*100)+'%';
        if(text) text.textContent=`Simulating Day ${current+i} · ${i}/${n}`;
        await new Promise(resolve=>setTimeout(resolve,35));
        const p=nextCalendarEvent();
        if(/NEXT MATCH/i.test(p.title)) log(`<strong>DAY ${current+i}</strong> ${esc(p.detail)}`,'match');
      }
      log(`<strong>DONE</strong> Advanced to Day ${Math.max(1,Number(state()?.day||current+n))}.`,'event');
      setTimeout(()=>addDaySimulator(),60);
    };

    box.querySelectorAll('[data-days]').forEach(btn=>btn.onclick=()=>run(btn.dataset.days));
    box.querySelector('#oms2DayGo').onclick=()=>run(box.querySelector('#oms2DayInput').value);
    box.querySelector('#oms2DayInput').onkeydown=e=>{if(e.key==='Enter') run(e.target.value)};
  }

  function render(){
    const home=document.querySelector('#home'); if(!home || (!state()?.started && !state()?.name)) return;
    styles();
    addDaySimulator();
    let d=document.getElementById('oms2Dashboard');
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

  window.OMSUpdate2={render,addDaySimulator};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',render,{once:true}); else render();
})();