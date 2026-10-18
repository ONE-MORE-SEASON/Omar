/* ONE MORE SEASON — UPDATE 2: FC-STYLE CAREER DASHBOARD + DAY SIMULATION
   Focus: smoother daily simulation, next-event flow and calendar integration.
   Keeps the existing career state and match simulator. No 3D, no minigames. */
(() => {
  'use strict';
  if (window.__OMS_UPDATE2__) return;
  window.__OMS_UPDATE2__ = true;

  const esc = s => String(s ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const state = () => window.state || null;
  const day = () => Math.max(1, Number(state()?.day || document.querySelector('#day')?.textContent || 1));
  const player = () => state()?.name || document.querySelector('#name')?.value || 'Your Player';
  const value = (key, fallback) => Math.max(0, Math.min(100, Number(state()?.[key] ?? fallback)));

  function styles(){
    if(document.getElementById('oms2Styles')) return;
    const s=document.createElement('style'); s.id='oms2Styles';
    s.textContent=`
      #oms2Dashboard{margin-top:18px;display:grid;grid-template-columns:1.25fr .75fr;gap:14px}
      .oms2Panel{border:1px solid #1d5579;border-radius:18px;background:linear-gradient(145deg,#091e30f7,#05121ef7);padding:18px;box-shadow:0 14px 40px #0006}
      .oms2Kicker{font-size:9px;letter-spacing:1.7px;font-weight:950;color:#79d0ff}.oms2Title{font-size:19px;font-weight:950;margin-top:4px}
      .oms2Stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:13px}.oms2Stat{padding:11px;border:1px solid #194963;border-radius:12px;background:#061724}.oms2Stat small{color:#8faec7}.oms2Stat b{display:block;font-size:20px;margin-top:3px}
      .oms2Bar{height:6px;background:#07131e;border-radius:99px;overflow:hidden;margin-top:7px}.oms2Bar i{display:block;height:100%;background:linear-gradient(90deg,#18d79b,#4bb7ff);transition:width .45s ease}
      .oms2List{display:grid;gap:7px;margin-top:11px}.oms2Item{padding:11px;border:1px solid #19455f;border-radius:11px;background:#061722}.oms2Item b{font-size:11px}.oms2Item p{margin:4px 0 0;color:#9db6c9;font-size:11px;line-height:1.35}
      .oms2Badge{float:right;border:1px solid #255a7d;border-radius:99px;padding:3px 6px;color:#9ed7ff;font-size:8px;font-weight:900}
      .oms2Objective{padding:10px;border:1px solid #194963;border-radius:11px;background:#071a2a;margin-top:8px}.oms2Objective b{font-size:11px}.oms2Objective small{display:block;color:#8faec7;margin-top:3px}
      #oms2DaySimulator{margin-top:14px;padding:16px;border:1px solid #286487;border-radius:16px;background:linear-gradient(135deg,#071a2a,#061421);box-shadow:0 12px 35px #0005}
      .oms2DayHead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.oms2DayTitle{font-size:17px;font-weight:950}.oms2DaySub{font-size:10px;color:#8faec7;margin-top:3px}
      .oms2DayNow{padding:9px 13px;border:1px solid #1e5877;border-radius:11px;background:#071b2b;text-align:right;min-width:90px}.oms2DayNow b{display:block;font-size:20px}.oms2DayNow small{color:#79d0ff;font-size:8px;letter-spacing:1.2px;font-weight:900}
      .oms2NextEvent{margin-top:12px;padding:12px;border:1px solid #1b4f6b;border-radius:11px;background:#061724}.oms2NextEvent span{float:right;color:#79d0ff;font-size:9px;font-weight:900}.oms2NextEvent b{font-size:11px}.oms2NextEvent small{display:block;color:#8faec7;margin-top:4px}
      .oms2Week{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:12px}.oms2WeekDay{padding:8px 4px;border:1px solid #173e57;border-radius:9px;background:#061622;text-align:center;min-height:55px}.oms2WeekDay small{display:block;color:#7599b3;font-size:8px}.oms2WeekDay b{display:block;margin-top:5px;font-size:12px}.oms2WeekDay.active{border-color:#18d79b;background:#07352f}.oms2WeekDay.match{box-shadow:inset 0 -3px #ffd45a}.oms2WeekDay.match b{color:#ffd45a}
      .oms2DayButtons{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}.oms2DayBtn{border:1px solid #285d7d;background:#0a2237;color:#d9e9f5;border-radius:9px;padding:9px 12px;font-size:10px;font-weight:950;min-width:58px}.oms2DayBtn:hover{border-color:#18d79b;background:#07352f}.oms2DayBtn:active{transform:scale(.97)}
      .oms2DayCustom{display:flex;gap:7px;margin-top:9px;align-items:center;flex-wrap:wrap}.oms2DayInput{width:95px;padding:9px 10px;border-radius:9px;border:1px solid #285d7d;background:#061724;color:#fff;font-weight:850;outline:none}.oms2DayInput:focus{border-color:#18d79b}.oms2DayGo{border:0;border-radius:9px;padding:9px 14px;background:linear-gradient(90deg,#087f69,#16d49b);color:#fff;font-weight:950;font-size:10px}
      .oms2SimStatus{margin-top:13px;border-top:1px solid #173c54;padding-top:12px}.oms2SimProgress{height:7px;background:#06121d;border-radius:99px;overflow:hidden}.oms2SimProgress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#18d79b,#4bb7ff);transition:width .18s ease}.oms2SimText{font-size:10px;color:#a9c5da;margin-top:7px}
      #oms2DayLog{margin-top:10px;display:grid;gap:6px;max-height:145px;overflow:auto}.oms2Log{font-size:10px;color:#a9c5da;padding:7px 9px;background:#061723;border-radius:8px;border-left:2px solid #285d7d}.oms2Log strong{color:#fff}.oms2Log.match{border-left-color:#ffd45a}.oms2Log.event{border-left-color:#18d79b}
      @media(max-width:900px){#oms2Dashboard{grid-template-columns:1fr}.oms2Stats{grid-template-columns:repeat(2,1fr)}.oms2Week{grid-template-columns:repeat(7,minmax(38px,1fr));overflow:auto}.oms2WeekDay{min-width:44px}}
      @media(max-width:500px){.oms2Stats{grid-template-columns:1fr 1fr}.oms2DayInput{width:80px}.oms2Week{gap:4px}}
      @media(prefers-reduced-motion:reduce){.oms2Bar i,.oms2SimProgress i{transition:none}}
    `; document.head.appendChild(s);
  }

  function calendarPanel(){
    const home=document.querySelector('#home'); if(!home) return null;
    return [...home.querySelectorAll('.panel')].find(p=>{
      const h=p.querySelector('h2')?.textContent.trim().toUpperCase();
      return h==='SEASON CALENDAR' || h==='PLAYER CALENDAR';
    });
  }

  function calendarEvents(){
    const panel=calendarPanel();
    if(!panel) return [];
    return [...panel.querySelectorAll('.event')].map(el=>({text:el.textContent.replace(/\s+/g,' ').trim(),el})).filter(x=>x.text);
  }

  function nextEvent(){
    const events=calendarEvents();
    const match=events.find(x=>/match|league|cup|champions|europa|final/i.test(x.text));
    if(match) return {kind:'MATCH',title:'NEXT MATCH',detail:match.text};
    return {kind:'CAREER',title:'NEXT CAREER EVENT',detail:'Training, recovery or a career event is coming next.'};
  }

  function upcomingDays(){
    const d=day();
    const events=calendarEvents();
    return Array.from({length:7},(_,i)=>{
      const n=d+i;
      const e=events.find(x=>new RegExp('DAY\\s*'+n+'\\b','i').test(x.text));
      const isMatch=e && /match|league|cup|champions|europa/i.test(e.text);
      return {n,event:e,isMatch:!!isMatch};
    });
  }

  function addDaySimulator(){
    const panel=calendarPanel(); if(!panel) return;
    let box=document.getElementById('oms2DaySimulator');
    if(!box){
      box=document.createElement('div'); box.id='oms2DaySimulator';
      const grid=panel.querySelector('.calendar');
      (grid||panel).insertAdjacentElement('afterend',box);
    }
    const current=day(), nxt=nextEvent(), week=upcomingDays();
    box.innerHTML=`
      <div class="oms2DayHead"><div><div class="oms2Kicker">CAREER TIME · FC-STYLE</div><div class="oms2DayTitle">Advance your career</div><div class="oms2DaySub">Move through days while keeping matches and important calendar events visible.</div></div><div class="oms2DayNow"><small>CURRENT DAY</small><b>${current}</b></div></div>
      <div class="oms2NextEvent"><span>${esc(nxt.kind)}</span><b>${esc(nxt.title)}</b><small>${esc(nxt.detail)}</small></div>
      <div class="oms2Week">${week.map((x,i)=>`<div class="oms2WeekDay ${i===0?'active ':''}${x.isMatch?'match':''}"><small>${i===0?'TODAY':['+1D','+2D','+3D','+4D','+5D','+6D'][i]}</small><b>${x.n}</b></div>`).join('')}</div>
      <div class="oms2DayButtons"><button class="oms2DayBtn" data-days="1">+1 DAY</button><button class="oms2DayBtn" data-days="2">+2 DAYS</button><button class="oms2DayBtn" data-days="3">+3 DAYS</button><button class="oms2DayBtn" data-days="7">+7 DAYS</button><button class="oms2DayBtn" data-days="14">+14 DAYS</button><button class="oms2DayBtn" data-days="30">+30 DAYS</button><button class="oms2DayBtn" data-next="1">NEXT EVENT</button></div>
      <div class="oms2DayCustom"><span class="oms2DaySub">Custom:</span><input class="oms2DayInput" id="oms2DayInput" type="number" min="1" max="365" value="5" aria-label="Number of days"><button class="oms2DayGo" id="oms2DayGo">SIMULATE DAYS →</button></div>
      <div class="oms2SimStatus"><div class="oms2SimProgress"><i id="oms2SimProgress"></i></div><div class="oms2SimText" id="oms2SimText">Ready · Day ${current}</div></div><div id="oms2DayLog"></div>`;

    const log=(html,type='')=>{const el=box.querySelector('#oms2DayLog');if(!el)return;const row=document.createElement('div');row.className='oms2Log '+type;row.innerHTML=html;el.prepend(row);while(el.children.length>8)el.lastElementChild.remove()};

    const run=async n=>{
      n=Math.max(1,Math.min(365,Math.floor(Number(n)||0))); if(!n)return;
      if(typeof window.advance!=='function'){log('<strong>ERROR</strong> Day advance is unavailable.','event');return;}
      const controls=[...box.querySelectorAll('button'),box.querySelector('#oms2DayInput')].filter(Boolean);controls.forEach(x=>x.disabled=true);
      const start=day(), progress=box.querySelector('#oms2SimProgress'), status=box.querySelector('#oms2SimText');
      log(`<strong>SIMULATION</strong> Starting at Day ${start} · ${n} day${n===1?'':'s'}.`);
      for(let i=1;i<=n;i++){
        window.advance(1);
        if(progress)progress.style.width=Math.round(i/n*100)+'%';
        const now=day();
        if(status)status.textContent=`Simulating Day ${now} · ${i}/${n}`;
        await new Promise(r=>setTimeout(r,30));
        if(i<n && calendarEvents().some(x=>new RegExp('DAY\\s*'+(now+1)+'\\b','i').test(x.text)&&/match|league|cup|champions|europa/i.test(x.text))) log(`<strong>UPCOMING</strong> Match on Day ${now+1}.`,'match');
      }
      log(`<strong>DONE</strong> Career advanced from Day ${start} to Day ${day()}.`,'event');
      setTimeout(addDaySimulator,80);
    };

    const next=()=>{
      const start=day();
      for(let i=1;i<=60;i++){
        const target=start+i;
        const e=calendarEvents().find(x=>new RegExp('DAY\\s*'+target+'\\b','i').test(x.text)&&/match|league|cup|champions|europa/i.test(x.text));
        if(e){run(i);return;}
      }
      run(1);
    };
    box.querySelectorAll('[data-days]').forEach(b=>b.onclick=()=>run(b.dataset.days));
    box.querySelector('[data-next]')?.addEventListener('click',next);
    box.querySelector('#oms2DayGo').onclick=()=>run(box.querySelector('#oms2DayInput').value);
    box.querySelector('#oms2DayInput').onkeydown=e=>{if(e.key==='Enter')run(e.target.value)};
  }

  function renderDashboard(){
    const home=document.querySelector('#home'); if(!home || (!state()?.started && !state()?.name))return;
    styles(); addDaySimulator();
    let d=document.getElementById('oms2Dashboard');
    if(!d){d=document.createElement('section');d.id='oms2Dashboard';const anchor=home.querySelector('.layout');(anchor||home).insertAdjacentElement(anchor?'afterend':'beforeend',d)}
    const form=value('form',68),fitness=value('fitness',92),morale=value('morale',78),sharp=value('sharp',85),interest=Math.min(100,Math.round((form+morale+sharp)/3));
    d.innerHTML=`<section class="oms2Panel"><div class="oms2Kicker">ONE MORE SEASON · CAREER INTELLIGENCE</div><div class="oms2Title">${esc(player())}'s Dashboard</div><div class="oms2Stats"><div class="oms2Stat"><small>FORM</small><b>${form}</b><div class="oms2Bar"><i style="width:${form}%"></i></div></div><div class="oms2Stat"><small>FITNESS</small><b>${fitness}</b><div class="oms2Bar"><i style="width:${fitness}%"></i></div></div><div class="oms2Stat"><small>MORALE</small><b>${morale}</b><div class="oms2Bar"><i style="width:${morale}%"></i></div></div><div class="oms2Stat"><small>SHARPNESS</small><b>${sharp}</b><div class="oms2Bar"><i style="width:${sharp}%"></i></div></div></div><div class="oms2Kicker" style="margin-top:16px">CAREER OBJECTIVES</div><div class="oms2List"><div class="oms2Objective"><b>CONSISTENCY</b><small>Maintain form above 70</small><div class="oms2Bar"><i style="width:${form}%"></i></div></div><div class="oms2Objective"><b>FITNESS</b><small>Keep fitness above 65</small><div class="oms2Bar"><i style="width:${fitness}%"></i></div></div><div class="oms2Objective"><b>SQUAD ROLE</b><small>Build manager trust</small><div class="oms2Bar"><i style="width:${Math.round((form+morale)/2)}%"></i></div></div></div></section><section class="oms2Panel"><div class="oms2Kicker">DAY ${day()} · SIMULATION FEED</div><div class="oms2Title">What matters now</div><div class="oms2List"><article class="oms2Item"><span class="oms2Badge">CAREER</span><b>NEXT STEP</b><p>Use the calendar and advance time to move your story forward.</p></article><article class="oms2Item"><span class="oms2Badge">TRAINING</span><b>PLAYER STATUS</b><p>Fitness, morale and sharpness can change as the career progresses.</p></article><article class="oms2Item"><span class="oms2Badge">MARKET</span><b>REPUTATION</b><p>Strong performances can create more interest around your player.</p></article></div><div class="oms2Kicker" style="margin-top:15px">MARKET INTEREST</div><div class="oms2Item"><b>${interest}%</b><p>Current simulated interest based on your profile.</p><div class="oms2Bar"><i style="width:${interest}%"></i></div></div></section>`;
  }

  window.OMSUpdate2={render:renderDashboard,addDaySimulator};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',renderDashboard,{once:true});else renderDashboard();
})();