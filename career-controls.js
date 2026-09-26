(() => {
  'use strict';

  const SAVE_KEY='oms_career_save_v3';
  const META_KEY='oms_career_meta_v3';
  const GAME_KEY='omsCareerDeep';
  const MAX_SEASONS=20;
  const $=id=>document.getElementById(id);

  const toast=(title,msg,good=true)=>{
    let t=$('careerControlToast');
    if(!t){
      t=document.createElement('div');
      t.id='careerControlToast';
      t.style.cssText='position:fixed;right:20px;bottom:20px;z-index:99999;max-width:380px;padding:14px 17px;border-radius:13px;border:1px solid #2b6788;background:#061a2a;color:#fff;box-shadow:0 18px 50px #0009;font:14px Inter,system-ui,sans-serif;opacity:0;transform:translateY(10px);transition:.2s';
      document.body.appendChild(t);
    }
    t.style.borderColor=good?'#18d99d':'#ff6f7d';
    t.innerHTML='<b>'+title+'</b><div style="color:#b8ccdd;margin-top:4px">'+msg+'</div>';
    requestAnimationFrame(()=>{t.style.opacity=1;t.style.transform='none'});
    clearTimeout(t._x);
    t._x=setTimeout(()=>{t.style.opacity=0;t.style.transform='translateY(10px)'},3500);
  };

  const getSeason=()=>{
    const candidates=[$('seasonLabel'),document.querySelector('.season-label'),document.querySelector('[data-season]')];
    for(const el of candidates){
      const m=(el?.textContent||'').match(/season\s*(\d+)/i);
      if(m)return Number(m[1]);
    }
    try{return Number(JSON.parse(localStorage.getItem(META_KEY)||'{}').season)||1}catch{return 1}
  };

  const setMeta=()=>localStorage.setItem(META_KEY,JSON.stringify({season:getSeason(),savedAt:new Date().toISOString()}));

  function snapshot(){
    const inputs={};
    document.querySelectorAll('input,select,textarea').forEach(el=>{if(el.id)inputs[el.id]=el.value});
    const views={};
    document.querySelectorAll('.view').forEach(v=>views[v.id]=v.classList.contains('active'));
    return {version:4,savedAt:new Date().toISOString(),localStorage:Object.fromEntries(Object.entries(localStorage).filter(([k])=>!k.startsWith('oms_career_save_'))),inputs,day:$('day')?.textContent||'1',date:$('date')?.textContent||'',views,season:getSeason()};
  }

  function saveCareer(){
    if(!localStorage.getItem(GAME_KEY)){toast('No active career','Start a career before saving.',false);return;}
    localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot()));setMeta();updateButtons();toast('Career saved','Your current career state has been saved in this browser.');
  }

  function loadCareer(){
    let s;try{s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch{s=null}
    if(!s){toast('No saved career','There is no saved career to load.',false);return;}
    Object.entries(s.localStorage||{}).forEach(([k,v])=>localStorage.setItem(k,v));
    Object.entries(s.inputs||{}).forEach(([id,v])=>{const el=$(id);if(el)el.value=v});
    if($('day'))$('day').textContent=s.day||'1';if($('date'))$('date').textContent=s.date||'';
    Object.entries(s.views||{}).forEach(([id,active])=>$(id)?.classList.toggle('active',!!active));
    if($('app'))$('app').classList.remove('hidden');if($('creator'))$('creator').classList.add('hidden');
    toast('Career loaded','Your saved career has been restored.');setTimeout(()=>window.dispatchEvent(new Event('careerLoaded')),50);
  }

  function resetCreatorForm(){
    const values={cName:'',cAge:'17',cNumber:'10',cPos:'ST',cFoot:'Right',cNation:'Sweden',cStyle:'Complete Forward',cAmb:'World Star',cClub:'Hillcrest Academy'};
    Object.entries(values).forEach(([id,value])=>{const el=$(id);if(el)el.value=value});
  }

  function deleteCareer(){
    if(!localStorage.getItem(GAME_KEY) && !localStorage.getItem(SAVE_KEY)){toast('No career found','There is no career to delete.',false);return;}
    if(!confirm('Delete this career? Your player, season and progress will be permanently removed.'))return;
    localStorage.removeItem(GAME_KEY);localStorage.removeItem(SAVE_KEY);localStorage.removeItem(META_KEY);
    Object.keys(localStorage).filter(k=>k.startsWith('oms_')).forEach(k=>localStorage.removeItem(k));
    try{if(typeof defaultState!=='undefined'&&typeof clone==='function'){state=clone(defaultState);state.started=false}}catch(e){}
    if($('app'))$('app').classList.add('hidden');if($('creator'))$('creator').classList.remove('hidden');resetCreatorForm();
    const loadBtn=$('loadCareerBtn');if(loadBtn)loadBtn.remove();window.scrollTo({top:0,behavior:'smooth'});updateButtons();toast('Career deleted','You are back at the very first Player Setup page.');
  }

  function updateButtons(){
    const hasGame=!!localStorage.getItem(GAME_KEY),hasSave=!!localStorage.getItem(SAVE_KEY),b=$('saveCareerBtn'),d=$('deleteCareerBtn');
    if(b)b.innerHTML='💾 SAVE CAREER';if(d)d.disabled=!(hasGame||hasSave);
  }

  function injectButtons(){
    if($('careerControls'))return;const top=document.querySelector('.top');if(!top)return;
    const box=document.createElement('div');box.id='careerControls';box.style.cssText='display:flex;gap:7px;align-items:center;margin-left:4px';
    box.innerHTML='<button id="saveCareerBtn" type="button" style="padding:8px 10px;border:1px solid #246487;border-radius:9px;background:#0a2235;color:#eaf7ff;font-weight:900;font-size:10px">💾 SAVE CAREER</button><button id="deleteCareerBtn" type="button" style="padding:8px 10px;border:1px solid #703d49;border-radius:9px;background:#24131a;color:#ffb9c1;font-weight:900;font-size:10px">🗑 DELETE CAREER</button>';
    const gear=top.querySelector('.gear');top.insertBefore(box,gear||null);$('saveCareerBtn').onclick=saveCareer;$('deleteCareerBtn').onclick=deleteCareer;updateButtons();
  }

  function injectLoad(){
    if($('loadCareerBtn')||!localStorage.getItem(SAVE_KEY))return;const start=document.querySelector('.start');if(!start)return;
    const b=document.createElement('button');b.id='loadCareerBtn';b.type='button';b.textContent='↻ LOAD SAVED CAREER';b.style.cssText='margin-top:10px;width:100%;padding:12px;border:1px solid #28658b;border-radius:12px;background:#0a2235;color:#dff5ff;font-weight:900';b.onclick=loadCareer;start.insertAdjacentElement('afterend',b);
  }

  function installLimit(){
    document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const txt=(b.innerText||'').toLowerCase();if(!/simulate season|next season|start new season|end season/.test(txt))return;const season=getSeason();if(season>=MAX_SEASONS){e.preventDefault();e.stopImmediatePropagation();toast('CAREER COMPLETE','20 seasons is the maximum career length.',false);return}setMeta()},true);
  }

  function enforceAgeEndpoint(){const age=Number($('cAge')?.value||0);if(age>=38){const b=document.querySelector('.start');if(b){b.disabled=true;b.style.opacity='.5';b.title='Active-player careers cannot start at 38+'}}}

  /* ==================== 100000X CALENDAR UPGRADE ==================== */
  function injectCalendarStyles(){
    if($('megaCalendarStyles'))return;
    const s=document.createElement('style');s.id='megaCalendarStyles';s.textContent=`
      #calendar{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;margin-top:18px;padding:12px;border:1px solid #1b4e6e;border-radius:16px;background:linear-gradient(145deg,#061522,#091d2e);}
      .mega-cal-head{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin:14px 0 0;padding:0 12px;color:#6f9dbb;font-size:10px;font-weight:950;letter-spacing:1px;text-align:center;text-transform:uppercase}
      .mega-cal-cell{min-height:105px;border:1px solid #174560;border-radius:12px;background:linear-gradient(145deg,#071b2b,#061421);padding:9px;position:relative;overflow:hidden;transition:.18s}
      .mega-cal-cell:hover{transform:translateY(-2px);border-color:#3a84ad;box-shadow:0 10px 25px #0005}
      .mega-cal-cell.today{border-color:#18d99d;box-shadow:0 0 0 1px #18d99d33,0 0 25px #18d99d16;background:linear-gradient(145deg,#07352f,#071b2a)}
      .mega-cal-cell.muted-day{opacity:.38}
      .mega-cal-num{font-weight:950;font-size:12px;color:#d8efff;display:flex;justify-content:space-between;align-items:center}
      .mega-cal-event{margin-top:7px;padding:6px 7px;border-radius:8px;background:#0b2940;border-left:3px solid #56bfff;font-size:9px;line-height:1.2;color:#cfe7f7;font-weight:800}
      .mega-cal-event.match{border-left-color:#18d99d}.mega-cal-event.training{border-left-color:#ffd65a}.mega-cal-event.cup{border-left-color:#b991ff}.mega-cal-event.award{border-left-color:#ff8dcb}.mega-cal-event.transfer{border-left-color:#ff6f7d}
      .mega-cal-badge{font-size:8px;padding:3px 5px;border-radius:999px;background:#0b2c43;color:#9ed7ff;white-space:nowrap}
      .mega-calendar-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;padding:12px 14px;border:1px solid #1a4a67;border-radius:14px;background:#061522}
      .mega-calendar-toolbar strong{font-size:17px}.mega-calendar-toolbar span{color:#8eafc5;font-size:11px}.mega-calendar-legend{display:flex;flex-wrap:wrap;gap:8px}.mega-calendar-legend span{font-size:9px;color:#9db8ca;padding:5px 7px;border:1px solid #204d68;border-radius:999px;background:#071b2a}
      @media(max-width:760px){#calendar{grid-template-columns:repeat(2,1fr)}.mega-cal-head{display:none}.mega-cal-cell{min-height:92px}.mega-calendar-toolbar{align-items:flex-start;flex-direction:column}}
      @media(max-width:480px){#calendar{grid-template-columns:1fr 1fr;gap:6px;padding:8px}.mega-cal-cell{min-height:82px;padding:7px}.mega-cal-event{font-size:8px}}
    `;document.head.appendChild(s);
  }

  function buildMegaCalendar(){
    const el=$('calendar');if(!el||!window.state||!state.started)return;
    injectCalendarStyles();
    const d=Math.max(1,Number(state.day)||1);
    const base=new Date(state.year,7,1);base.setDate(base.getDate()+d-1);
    const monthStart=new Date(base.getFullYear(),base.getMonth(),1),daysInMonth=new Date(base.getFullYear(),base.getMonth()+1,0).getDate();
    const start=(monthStart.getDay()+6)%7;
    const monthName=base.toLocaleDateString('en-GB',{month:'long',year:'numeric'}).toUpperCase();
    const monthEl=$('month');if(monthEl)monthEl.textContent=monthName;
    const toolbar=document.createElement('div');toolbar.className='mega-calendar-toolbar';toolbar.innerHTML='<div><strong>'+monthName+'</strong><br><span>Season '+state.season+' · Day '+d+' · Your career timeline</span></div><div class="mega-calendar-legend"><span>⚽ MATCH</span><span>🏃 TRAINING</span><span>🏆 CUP</span><span>🏅 AWARD</span><span>💼 TRANSFER</span></div>';
    const head=document.createElement('div');head.className='mega-cal-head';['MON','TUE','WED','THU','FRI','SAT','SUN'].forEach(x=>{const h=document.createElement('div');h.textContent=x;head.appendChild(h)});
    const grid=document.createDocumentFragment();
    for(let i=0;i<start;i++){const c=document.createElement('div');c.className='mega-cal-cell muted-day';grid.appendChild(c)}
    const opps=['Hillcrest Academy','Göteborg FC','Helsingborg','Örebro SK','Västerås','Utsiktens BK','Real Sociedad B','Aston Villa U21'];
    for(let day=1;day<=daysInMonth;day++){
      const absolute=Math.floor((new Date(base.getFullYear(),base.getMonth(),day)-new Date(state.year,7,1))/86400000)+1;
      const cell=document.createElement('div');cell.className='mega-cal-cell'+(absolute===d?' today':'');
      const num=document.createElement('div');num.className='mega-cal-num';num.innerHTML='<span>'+day+'</span>'+(absolute===d?'<span class="mega-cal-badge">TODAY</span>':'');cell.appendChild(num);
      const add=(type,icon,text)=>{const e=document.createElement('div');e.className='mega-cal-event '+type;e.textContent=icon+' '+text;cell.appendChild(e)};
      if(absolute>0&&absolute%7===1){const opp=opps[Math.floor((absolute-1)/7)%opps.length];add(absolute%28===1?'cup':'match','⚽',absolute%28===1?'CUP · '+opp:'LEAGUE · '+opp)}
      else if(absolute>0&&absolute%7===4)add('training','🏃','TRAINING · '+state.player.training);
      if(absolute>0&&absolute%30===15)add('award','🏅','PLAYER OF THE MONTH');
      if(absolute>0&&absolute%45===20)add('transfer','💼','TRANSFER WINDOW');
      if(absolute>0&&absolute%120===60)add('award','🏆','SEASON AWARDS');
      if(cell.children.length===1){const e=document.createElement('div');e.className='mega-cal-event';e.style.opacity='.45';e.textContent='—';cell.appendChild(e)}
      grid.appendChild(cell);
    }
    while((start+daysInMonth)%7){const c=document.createElement('div');c.className='mega-cal-cell muted-day';grid.appendChild(c)}
    el.innerHTML='';el.style.gridColumn='';el.parentNode.insertBefore(toolbar,el);el.parentNode.insertBefore(head,el);el.appendChild(grid);
  }

  const oldRenderHome=window.renderHome;
  if(typeof oldRenderHome==='function'){
    window.renderHome=function(){oldRenderHome();buildMegaCalendar()};
  }

  function init(){
    injectButtons();injectLoad();installLimit();enforceAgeEndpoint();injectCalendarStyles();
    setTimeout(buildMegaCalendar,100);
    setInterval(()=>{injectButtons();injectLoad();updateButtons();enforceAgeEndpoint();buildMegaCalendar()},1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();