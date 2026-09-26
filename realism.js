(() => {
  'use strict';

  /* ONE MORE SEASON — REALISM + CAREER CALENDAR ENGINE
     Loaded after index.html so it can enhance the existing simulator without changing the core UI. */

  const KEY = 'oms_realism_v2';
  const old = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
  const rs = old;
  rs.transferRequests = Number(rs.transferRequests || 0);
  rs.lastTransferRequestDay = Number(rs.lastTransferRequestDay || -999);
  rs.injuryDays = Number(rs.injuryDays || 0);
  rs.suspensionMatches = Number(rs.suspensionMatches || 0);
  rs.contractYears = Number(rs.contractYears || 3);
  rs.matchesSinceTransferRequest = Number(rs.matchesSinceTransferRequest || 0);
  rs.lastPlayedFixtureDay = Number(rs.lastPlayedFixtureDay || -1);
  rs.matchAvailability = rs.matchAvailability || 'AVAILABLE';
  rs.calendarVersion = 2;
  localStorage.setItem(KEY, JSON.stringify(rs));

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function toast(title, message, good = true) {
    let t = $('realismToast');
    if (!t) {
      t = document.createElement('div'); t.id = 'realismToast';
      t.style.cssText = 'position:fixed;right:22px;bottom:22px;z-index:9999;max-width:400px;padding:16px 18px;border:1px solid #2b6788;border-radius:14px;background:linear-gradient(145deg,#071d2e,#04111c);box-shadow:0 18px 55px #000b;color:#fff;font:14px Inter,system-ui,sans-serif;opacity:0;transform:translateY(12px);transition:.22s';
      document.body.appendChild(t);
    }
    t.style.borderColor = good ? '#18d99d' : '#ff6f7d';
    t.innerHTML = '<b style="display:block;margin-bottom:5px">'+esc(title)+'</b><span style="color:#b8ccdd">'+esc(message)+'</span>';
    requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='none'; });
    clearTimeout(t._timer); t._timer=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(12px)'},4200);
  }

  function saveRS(){ localStorage.setItem(KEY, JSON.stringify(rs)); }
  function day(){ return Number(window.state?.day || $('day')?.textContent?.replace(/\D/g,'') || 1); }
  function age(){ return Number(window.state?.player?.age || $('cAge')?.value || 17); }

  /* ---------------- AGE / CAREER RULES ---------------- */
  function installAgeRule(){
    const input=$('cAge'); if(!input) return;
    input.max='45'; input.title='Players aged 38+ cannot start an active-player career.';
    input.addEventListener('input',()=>input.style.borderColor=Number(input.value)>=38?'#ff6f7d':'');
    const start=document.querySelector('.start');
    if(start && !start.dataset.ageRule){
      start.dataset.ageRule='1';
      start.addEventListener('click',e=>{
        const a=Number(input.value||17);
        if(a>=38){e.preventDefault();e.stopImmediatePropagation();toast('Career start blocked',a+' is too old for an active-player career. Start at 37 or younger.',false)}
        else if(a>=33) toast('Veteran career','You can start, but development slows and retirement risk rises each season.');
      },true);
    }
  }

  /* ---------------- SEASON SCHEDULE ---------------- */
  const leagueOpponents=['Hillcrest Academy','Göteborg FC','Helsingborg','Örebro SK','Västerås','Utsiktens BK','Real Sociedad B','Aston Villa U21','Villarreal B','Real Betis B'];
  const cups=[
    {day:24,name:'National Cup — Round 1',type:'CUP',icon:'🏆'},
    {day:78,name:'National Cup — Round 2',type:'CUP',icon:'🏆'},
    {day:156,name:'National Cup — Quarter-final',type:'CUP',icon:'🏆'},
    {day:212,name:'National Cup — Semi-final',type:'CUP',icon:'🏆'},
    {day:268,name:'National Cup — Final',type:'CUP',icon:'🏆'}
  ];
  const continental=[
    {day:35,name:'Champions League — Group/League Match',type:'UCL',icon:'⭐'},
    {day:63,name:'Champions League — Group/League Match',type:'UCL',icon:'⭐'},
    {day:91,name:'Champions League — Group/League Match',type:'UCL',icon:'⭐'},
    {day:210,name:'Champions League — Round of 16',type:'UCL',icon:'⭐'},
    {day:238,name:'Champions League — Quarter-final',type:'UCL',icon:'⭐'},
    {day:266,name:'Champions League — Semi-final',type:'UCL',icon:'⭐'},
    {day:294,name:'Champions League — Final',type:'UCL',icon:'⭐'}
  ];
  const awards=[
    {day:305,name:'Player of the Season ceremony',type:'AWARD',icon:'👑'},
    {day:309,name:'Ballon d’Or ceremony',type:'BALLON',icon:'🌟'},
    {day:313,name:'Golden Boot announcement',type:'AWARD',icon:'🥇'},
    {day:317,name:'Team of the Season',type:'AWARD',icon:'🏅'},
    {day:321,name:'Young Player of the Season',type:'AWARD',icon:'🌱'}
  ];

  function scheduleForDay(d){
    const out=[];
    if(d===1) out.push({day:d,name:'Season Kick-off / Squad meeting',type:'CLUB',icon:'📋'});
    if(d===14) out.push({day:d,name:'Transfer Window Deadline — winter',type:'TRANSFER',icon:'🔄'});
    if(d===15) out.push({day:d,name:'Winter transfer window opens',type:'TRANSFER',icon:'🔄'});
    if(d===198) out.push({day:d,name:'Summer transfer window opens',type:'TRANSFER',icon:'🔄'});
    if(d===257) out.push({day:d,name:'Summer transfer window deadline',type:'TRANSFER',icon:'⏳'});
    if(d===170 || d===250) out.push({day:d,name:'International break',type:'NATIONAL',icon:'🌍'});
    cups.forEach(e=>{if(e.day===d)out.push({...e})});
    continental.forEach(e=>{if(e.day===d)out.push({...e})});
    awards.forEach(e=>{if(e.day===d)out.push({...e})});
    // League matches every 7 days, never every day.
    if(d>=1 && d<=280 && d%7===1){
      const index=Math.floor((d-1)/7)%leagueOpponents.length;
      const home=Math.floor((d-1)/7)%2===0;
      out.push({day:d,name:leagueOpponents[index]+' '+(home?'(H)':'(A)'),type:'LEAGUE',icon:'⚽',home,opp:leagueOpponents[index]});
    }
    // Training/recovery occupy the days between matches instead of fake match spam.
    if(!out.some(e=>['LEAGUE','CUP','UCL'].includes(e.type))){
      if(d%7===4) out.push({day:d,name:'Team training + development',type:'TRAINING',icon:'🏃'});
      else if(d%7===5) out.push({day:d,name:'Recovery + fitness',type:'RECOVERY',icon:'⚡'});
      else if(d%7===6) out.push({day:d,name:'Tactical preparation',type:'TACTICAL',icon:'🧠'});
      else if(d%7===0) out.push({day:d,name:'Rest day',type:'REST',icon:'😴'});
    }
    return out;
  }

  function upcoming(n=42){
    const arr=[]; for(let d=day();d<Math.min(366,day()+n);d++) scheduleForDay(d).forEach(e=>arr.push(e));
    return arr;
  }

  function nextPlayableMatch(){
    for(let d=day();d<=365;d++){
      const e=scheduleForDay(d).find(x=>['LEAGUE','CUP','UCL'].includes(x.type));
      if(e) return e;
    }
    return null;
  }

  /* ---------------- FIXTURE CONTROL: NO MATCH EVERY DAY ---------------- */
  function installFixtureRules(){
    if(typeof window.currentFixture==='function'){
      window.currentFixture=function(){
        const e=scheduleForDay(day()).find(x=>['LEAGUE','CUP','UCL'].includes(x.type));
        if(e) return {day:e.day,opp:e.opp||e.name,home:e.home!==false,comp:e.type==='UCL'?'CHAMPIONS LEAGUE':e.type==='CUP'?'CUP':'LEAGUE'};
        const n=nextPlayableMatch();
        if(n) return {day:n.day,opp:n.opp||n.name,home:n.home!==false,comp:n.type==='UCL'?'CHAMPIONS LEAGUE':n.type==='CUP'?'CUP':'LEAGUE'};
        return {day:365,opp:'Season complete',home:true,comp:'SEASON'};
      };
    }

    const originalMatch=window.simulateMatch;
    if(typeof originalMatch==='function' && !originalMatch._realismWrapped){
      const wrapped=function(){
        const events=scheduleForDay(day());
        const fx=events.find(e=>['LEAGUE','CUP','UCL'].includes(e.type));
        if(!fx){
          const next=nextPlayableMatch();
          const gap=next?next.day-day():0;
          toast('No match today',next?'Today is a '+(events[0]?.type||'training')+' day. Next match: Day '+next.day+' in '+gap+' day(s).':'The season is complete.',false);
          return;
        }
        if(rs.injuryDays>0){toast('Unavailable','You are injured for '+rs.injuryDays+' more day(s) and cannot play this match.',false);return;}
        if(rs.suspensionMatches>0){rs.suspensionMatches--;saveRS();toast('Suspension served','You missed this match because of suspension.');advanceAfterMiss();return;}
        rs.lastPlayedFixtureDay=fx.day;rs.matchesSinceTransferRequest++;saveRS();
        originalMatch();
      };
      wrapped._realismWrapped=true; window.simulateMatch=wrapped;
    }
  }

  function advanceAfterMiss(){
    if(typeof window.advanceOneDay==='function') window.advanceOneDay();
  }

  /* ---------------- REALISTIC CALENDAR UI ---------------- */
  function injectCalendarView(){
    if($('calendarView')) return;
    const main=document.querySelector('main'); if(!main) return;
    const section=document.createElement('section'); section.id='calendarView'; section.className='view';
    section.innerHTML=`
      <div class="panel calendar-shell">
        <div class="panel-title">
          <div><div class="eyebrow">CAREER SCHEDULE</div><h2>SEASON CALENDAR</h2><div class="muted">Every day has a purpose. Matches are scheduled; training and recovery happen between them.</div></div>
          <span class="pill" id="calSeason">SEASON 1</span>
        </div>
        <div class="calendar-toolbar">
          <button class="action secondary" id="calPrev">← PREVIOUS 14 DAYS</button>
          <div class="cal-current" id="calRange">DAY 1–14</div>
          <button class="action secondary" id="calNext">NEXT 14 DAYS →</button>
        </div>
        <div id="fullCalendar"></div>
        <div class="calendar-legend">
          <span>⚽ Match</span><span>🏃 Training</span><span>⚡ Recovery</span><span>🏆 Cup</span><span>⭐ Champions League</span><span>👑 Award</span><span>🔄 Transfers</span>
        </div>
      </div>`;
    main.appendChild(section);
    $('calPrev').onclick=()=>{calendarOffset=Math.max(1,calendarOffset-14);renderFullCalendar()};
    $('calNext').onclick=()=>{calendarOffset=Math.min(352,calendarOffset+14);renderFullCalendar()};
  }
  let calendarOffset=1;

  function renderFullCalendar(){
    const el=$('fullCalendar'); if(!el) return;
    const start=Math.min(352,Math.max(1,calendarOffset)); const end=Math.min(365,start+13);
    $('calRange').textContent='DAY '+start+'–'+end;
    $('calSeason').textContent='SEASON '+(window.state?.season||1);
    const rows=[];
    for(let d=start;d<=end;d++){
      const events=scheduleForDay(d);
      const today=d===day();
      rows.push(`<div class="cal-row ${today?'cal-today':''}"><div class="cal-day"><b>DAY ${d}</b><small>${dateForDay(d)}</small>${today?'<span class="pill">TODAY</span>':''}</div><div class="cal-events">${events.map(e=>`<div class="cal-event ${e.type.toLowerCase()}"><span class="cal-icon">${e.icon}</span><div><b>${esc(e.name)}</b><small>${esc(labelForType(e.type))}</small></div></div>`).join('')}</div></div>`);
    }
    el.innerHTML=rows.join('');
  }
  function dateForDay(d){
    const y=Number(window.state?.year||2025); const dt=new Date(y,7,1); dt.setDate(dt.getDate()+d-1); return dt.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short'}).toUpperCase();
  }
  function labelForType(t){return ({LEAGUE:'League Match',CUP:'Cup Match',UCL:'Champions League',TRAINING:'Training',RECOVERY:'Recovery',TACTICAL:'Tactical Day',REST:'Rest Day',TRANSFER:'Transfer Market',AWARD:'Awards',BALLON:'Ballon d’Or',NATIONAL:'International Football',CLUB:'Club Event'})[t]||t}

  function injectCalendarStyles(){
    if($('calendarStyles'))return;
    const s=document.createElement('style');s.id='calendarStyles';s.textContent=`
      .calendar-shell{margin-top:18px}.calendar-toolbar{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin:18px 0}.calendar-toolbar .action{margin:0}.cal-current{text-align:center;font-weight:950;color:#9ddcff;letter-spacing:1px}.cal-row{display:grid;grid-template-columns:125px 1fr;gap:14px;padding:11px 0;border-bottom:1px solid #153c55}.cal-row.cal-today{background:linear-gradient(90deg,#0a3b3540,transparent);border-radius:10px}.cal-day{display:grid;align-content:center;gap:4px;padding:8px 10px}.cal-day b{font-size:12px}.cal-day small{color:#7898ae;font-size:10px}.cal-day .pill{width:max-content}.cal-events{display:flex;flex-wrap:wrap;gap:8px}.cal-event{display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid #1d4c68;border-radius:11px;background:#071a2a;min-width:245px}.cal-event small{display:block;color:#7e9bb0;margin-top:3px}.cal-event.league{border-color:#18d99d66}.cal-event.cup{border-color:#ffd65a66}.cal-event.ucl{border-color:#8b7dff77}.cal-event.award,.cal-event.ballon{border-color:#ffd65a88}.cal-event.training{border-color:#56bfff66}.cal-event.recovery{border-color:#6eeaff55}.cal-icon{font-size:20px}.calendar-legend{display:flex;flex-wrap:wrap;gap:9px;margin-top:16px;color:#9db8cc;font-size:11px}.calendar-legend span{padding:7px 9px;border:1px solid #173f57;border-radius:999px;background:#061722}
      @media(max-width:700px){.calendar-toolbar{grid-template-columns:1fr}.cal-current{order:-1}.cal-row{grid-template-columns:1fr}.cal-event{min-width:0;width:100%}}
    `;document.head.appendChild(s);
  }

  function addCalendarNav(){
    const nav=$('nav'); if(!nav || $('calendarNavBtn')) return;
    const b=document.createElement('button');b.id='calendarNavBtn';b.textContent='CALENDAR';
    b.onclick=()=>{window.show('calendarView',b);renderFullCalendar()};
    nav.appendChild(b);
  }

  function injectHomeSchedule(){
    if($('homeSchedule'))return;
    const home=$('home');if(!home)return;
    const p=document.createElement('section');p.id='homeSchedule';p.className='panel';p.style.marginTop='18px';
    p.innerHTML=`<div class="panel-title"><div><h2>UPCOMING SCHEDULE</h2><div class="muted">No more fake matches every day — the calendar controls what happens next.</div></div><button class="action secondary" style="width:auto;margin:0" id="openCalendar">VIEW FULL CALENDAR →</button></div><div class="calendar" id="upcomingSchedule"></div>`;
    home.appendChild(p);$('openCalendar').onclick=()=>{window.show('calendarView',$('calendarNavBtn'));calendarOffset=Math.max(1,day()-2);renderFullCalendar()};
  }

  function renderUpcoming(){
    const el=$('upcomingSchedule');if(!el)return;
    const events=upcoming(28).slice(0,8);
    el.innerHTML=events.map(e=>`<div class="event ${e.day===day()?'today':''}"><div style="font-size:20px">${e.icon}</div><b>DAY ${e.day}</b><div class="muted" style="margin-top:7px">${esc(e.name)}</div><span class="pill" style="margin-top:8px">${esc(labelForType(e.type))}</span></div>`).join('');
  }

  /* ---------------- INJURY / SUSPENSION / TRANSFER LIMITS ---------------- */
  function injectRealismPanel(){
    if($('realismPanel'))return; const home=$('home');if(!home)return;
    const panel=document.createElement('section');panel.id='realismPanel';panel.className='panel';panel.style.marginTop='18px';
    panel.innerHTML=`<div class="panel-title"><div><h2>REALISM ENGINE</h2><div class="muted">Your career has rules, consequences and limits.</div></div><span class="pill">LIVE</span></div><div class="metric-grid" style="grid-template-columns:repeat(4,1fr)"><div class="metric"><span class="muted">TRANSFER REQUESTS</span><b id="rrTransfers">${rs.transferRequests}/2</b></div><div class="metric"><span class="muted">AVAILABILITY</span><b id="rrAvailability">AVAILABLE</b></div><div class="metric"><span class="muted">SUSPENSION</span><b id="rrSuspension">${rs.suspensionMatches||'None'}</b></div><div class="metric"><span class="muted">CONTRACT</span><b id="rrContract">${rs.contractYears}y</b></div></div>`;
    home.appendChild(panel);
  }
  function refreshPanel(){
    $('rrTransfers')&&($('rrTransfers').textContent=Math.min(rs.transferRequests,2)+'/2');
    $('rrAvailability')&&($('rrAvailability').textContent=rs.injuryDays>0?rs.injuryDays+'d injured':(rs.suspensionMatches?'SUSPENDED':'AVAILABLE'));
    $('rrSuspension')&&($('rrSuspension').textContent=rs.suspensionMatches||'None');
    $('rrContract')&&($('rrContract').textContent=rs.contractYears+'y');
  }

  function transferRequestAllowed(){
    const d=day();
    if(rs.transferRequests>=2){toast('Transfer request denied','You have already asked to leave twice this season. Wait for the next season.',false);return false}
    if(d-rs.lastTransferRequestDay<12){toast('Too soon','Your club and agent need time to react before another request.',false);return false}
    rs.transferRequests++;rs.lastTransferRequestDay=d;rs.matchesSinceTransferRequest=0;saveRS();refreshPanel();toast('Transfer request submitted','Your agent will contact clubs. Repeated requests can hurt club trust.');return true;
  }
  function installTransferRule(){
    document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const t=(b.innerText||'').toLowerCase();if(/request transfer|ask for transfer|request a transfer|transfer request|ask to leave|want to leave/.test(t)){e.preventDefault();e.stopImmediatePropagation();transferRequestAllowed()}},true);
  }

  function updateAgeDevelopment(){
    const p=window.state?.player;if(!p)return;
    if(p.age>=38){p.ovr=Math.max(1,p.ovr-1)}
    if(p.age>=34 && Math.random()<.08){p.fitness=Math.max(30,p.fitness-3)}
  }

  function installDayEffects(){
    const originalAdvance=window.advanceOneDay;if(typeof originalAdvance!=='function'||originalAdvance._realismWrapped)return;
    const wrapped=function(){
      if(rs.injuryDays>0) rs.injuryDays=Math.max(0,rs.injuryDays-1);
      updateAgeDevelopment();
      originalAdvance();
      saveRS();refreshPanel();renderUpcoming();
    };wrapped._realismWrapped=true;window.advanceOneDay=wrapped;
  }

  /* Prevent the existing Home button from pretending that every day is a match. */
  function patchHomeMatchButton(){
    const buttons=[...document.querySelectorAll('button')];
    buttons.forEach(b=>{
      if(b.dataset.schedulePatched)return;
      if((b.getAttribute('onclick')||'').includes('simulateMatch')){
        b.dataset.schedulePatched='1';
        b.textContent='SIMULATE NEXT MATCH →';
      }
    });
  }

  function init(){
    installAgeRule();
    injectCalendarView();
    injectCalendarStyles();
    addCalendarNav();
    injectHomeSchedule();
    injectRealismPanel();
    installFixtureRules();
    installTransferRule();
    installDayEffects();
    patchHomeMatchButton();
    renderFullCalendar();
    renderUpcoming();
    refreshPanel();
    setInterval(()=>{
      installAgeRule();addCalendarNav();injectHomeSchedule();injectRealismPanel();patchHomeMatchButton();renderUpcoming();refreshPanel();
    },1200);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
