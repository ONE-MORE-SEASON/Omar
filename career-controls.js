/* ONE MORE SEASON — FC27-inspired Daily Simulation + Calendar v1
   Built for Player Career. Inspired by modern career-mode ideas such as deeper simulation,
   daily activities, form/morale/fitness, rivalries and unexpected events.
*/
(() => {
  'use strict';

  const STORAGE='omsCareerStable3';
  const WEEK=['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const TEAMS=['Barcelona','Real Madrid','Bayern Munich','Borussia Dortmund','Inter','AC Milan','Juventus','Napoli','Paris Saint-Germain','Liverpool','Arsenal','Manchester City','Manchester United','Ajax','Benfica','Porto'];
  const EVENTS=[
    {type:'TRAINING',title:'Focused training',text:'A focused session improves sharpness but costs some fitness.',icon:'▣'},
    {type:'RECOVERY',title:'Recovery day',text:'A lighter day restores fitness and protects your form.',icon:'+'},
    {type:'MEDIA',title:'Media attention',text:'Your recent performances have attracted attention.',icon:'◉'},
    {type:'SCOUT',title:'Scout report',text:'A scout has added you to a watchlist.',icon:'⌕'},
    {type:'PRESS',title:'Press conference',text:'The media wants your answer after recent results.',icon:'◌'},
    {type:'RIVALRY',title:'Rivalry watch',text:'A player in your position is pushing for the same minutes.',icon:'VS'},
    {type:'TEAM',title:'Team meeting',text:'The squad wants a strong response in the next match.',icon:'◎'}
  ];

  function get(){
    try{return window.OMS_GET_STATE ? window.OMS_GET_STATE() : JSON.parse(localStorage.getItem(STORAGE)||'null')}catch(e){return null}
  }
  function save(s){
    try{localStorage.setItem(STORAGE,JSON.stringify(s));window.OMS_CURRENT_STATE=s}catch(e){}
  }
  function esc(v){return String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]))}
  function dayName(day){return WEEK[Math.max(0,(day-1)%7)]}
  function seasonDay(s){return ((s.day-1)%28)+1}
  function nextOpponent(s){
    const idx=Math.floor((s.day+Math.max(0,s.season-1)*3)/7)%TEAMS.length;
    const fallback=['Hillcrest Academy','BK Häcken','Villarreal','Aston Villa'];
    return TEAMS[idx] || fallback[idx%fallback.length];
  }
  function matchEvery(day){return day%7===1 || day%7===5}
  function activityFor(s,day){
    if(matchEvery(day)) return {type:'MATCH',title:'Matchday',text:day%14===1?'League match':'League / cup match',icon:'⚽'};
    const seed=(day+s.season*7)%10;
    return seed<3?EVENTS[0]:seed<5?EVENTS[1]:seed<7?EVENTS[6]:seed===7?EVENTS[4]:seed===8?EVENTS[5]:EVENTS[2];
  }
  function ensure(s){
    if(!s.dailyLog)s.dailyLog=[];
    if(!s.formResults)s.formResults=[];
    if(!s.matchHistory)s.matchHistory=[];
    if(!s.dailyEventDay)s.dailyEventDay=s.day;
    if(!s.rivalName)s.rivalName='Squad rival';
    if(s.apps==null)s.apps=0;
    if(s.goals==null)s.goals=0;
    if(s.assists==null)s.assists=0;
    if(s.motm==null)s.motm=0;
    if(s.points==null)s.points=0;
    if(s.avgRating==null)s.avgRating=0;
    return s;
  }

  function addLog(s,title,text){
    s.dailyLog.push({day:s.day,title,text});
    s.dailyLog=s.dailyLog.slice(-40);
  }

  function eventChoice(s){
    const pool=EVENTS.filter(e=>e.type!=='MATCH');
    return pool[(s.day+s.season*11)%pool.length];
  }

  function simulateDay(s, silent=false){
    const a=activityFor(s,s.day);
    s.fitness=Math.max(35,Math.min(100,s.fitness));
    s.sharp=Math.max(35,Math.min(100,s.sharp));
    s.morale=Math.max(30,Math.min(100,s.morale));

    if(a.type==='MATCH'){
      const difficulty=s.difficulty==='legend'?0.10:s.difficulty==='hard'?0.05:0;
      const performance=(s.ovr/100)*0.42+(s.fitness/100)*0.20+(s.sharp/100)*0.15+(s.morale/100)*0.13+Math.random()*0.18-difficulty;
      const opponent=nextOpponent(s);
      const win=performance>.64, draw=!win&&performance>.48;
      const gf=Math.max(0,Math.round(performance*5+Math.random()*2));
      const ga=win?Math.max(0,Math.round(Math.random()*2)):draw?Math.max(0,Math.round(Math.random()*2)):Math.max(1,Math.round(Math.random()*3));
      const rating=Math.max(5.5,Math.min(9.8,6.1+performance*3.2+Math.random()*0.8));
      const goalChance=Math.min(.62,Math.max(.05,(s.ovr-60)/70+(s.pos==='ST'?0.12:0))); 
      const scored=Math.random()<goalChance;
      const assisted=!scored && Math.random()<.25;
      s.apps++;
      if(scored)s.goals++;
      if(assisted)s.assists++;
      if(rating>=8.3)s.motm++;
      s.avgRating=((s.avgRating*(s.apps-1))+rating)/s.apps;
      const pts=win?3:draw?1:0;
      s.points+=pts;
      s.wins=(s.wins||0)+(win?1:0);s.draws=(s.draws||0)+(draw?1:0);s.losses=(s.losses||0)+(!win&&!draw?1:0);
      s.formResults.push(win?'W':draw?'D':'L');s.formResults=s.formResults.slice(-5);
      s.fitness=Math.max(35,s.fitness-7+Math.random()*2);
      s.sharp=Math.min(100,s.sharp+6);
      s.morale=Math.max(25,Math.min(100,s.morale+(win?5:draw?1:-4)));
      s.lastMatch={home:s.club||'Your Club',away:opponent,homeScore:gf,awayScore:ga,rating:rating.toFixed(1),result:win?'W':draw?'D':'L',day:s.day,scored,assisted};
      s.matchHistory.push(s.lastMatch);s.matchHistory=s.matchHistory.slice(-20);
      addLog(s,win?'Match won':draw?'Match drawn':'Match lost',`${s.club||'Your club'} ${gf}-${ga} ${opponent} · ${rating.toFixed(1)} rating`);
      s.day++;
      if(!silent && typeof window.toast==='function')window.toast(win?'MATCH WON · +3 POINTS':draw?'MATCH DRAW · +1 POINT':'MATCH LOST · BOUNCE BACK');
      return 'match';
    }

    const ev=eventChoice(s);
    if(ev.type==='TRAINING'){
      s.sharp=Math.min(100,s.sharp+4+Math.random()*3);s.fitness=Math.max(40,s.fitness-2);s.morale=Math.min(100,s.morale+1);
    }else if(ev.type==='RECOVERY'){
      s.fitness=Math.min(100,s.fitness+7);s.sharp=Math.max(35,s.sharp-1);
    }else if(ev.type==='PRESS'){
      s.morale=Math.min(100,s.morale+(Math.random()>.45?3:-3));
    }else if(ev.type==='RIVALRY'){
      s.morale=Math.min(100,s.morale+1);
    }else{
      s.morale=Math.min(100,s.morale+2);
    }
    addLog(s,ev.title,ev.text);
    s.day++;
    if(!silent && typeof window.toast==='function')window.toast(ev.title.toUpperCase());
    return ev.type.toLowerCase();
  }

  function seasonCheck(s){
    if(s.day>300){s.season=(s.season||1)+1;s.day=1;s.fitness=90;s.sharp=85;s.formResults=[];addLog(s,'NEW SEASON','A new season begins. Your goals have been reset.');}
  }

  function renderMatch(s){
    const m=s.lastMatch;
    const home=document.getElementById('omsHomeName'),away=document.getElementById('omsAwayName');
    const hs=document.getElementById('omsHomeScore'),as=document.getElementById('omsAwayScore'),sum=document.getElementById('omsMatchSummary'),rate=document.getElementById('omsMatchRating'),events=document.getElementById('omsMatchEvents');
    if(!home||!m)return;
    home.textContent=m.home;away.textContent=m.away;hs.textContent=m.homeScore;as.textContent=m.awayScore;rate.textContent=m.rating+' / 10';
    sum.textContent=m.result==='W'?'Strong performance and three points.':m.result==='D'?'A point earned. Time to push on.':'A difficult result. The next session matters.';
    const moments=[];
    if(m.scored)moments.push('⚽ You scored');
    if(m.assisted)moments.push('🅰 You created a goal');
    if(+m.rating>=8)moments.push('⭐ Player of the match contender');
    if(!moments.length)moments.push('↗ You completed your role and contributed to the team');
    events.innerHTML=moments.map(x=>'<div class="match-event">'+x+'</div>').join('');
    const a=document.getElementById('omsApps'),g=document.getElementById('omsGoals'),asst=document.getElementById('omsAssists'),avg=document.getElementById('omsAvgRating'),motm=document.getElementById('omsMotm'),pts=document.getElementById('omsPoints'),form=document.getElementById('omsForm');
    if(a)a.textContent=s.apps||0;if(g)g.textContent=s.goals||0;if(asst)asst.textContent=s.assists||0;if(avg)avg.textContent=s.avgRating?(+s.avgRating).toFixed(1):'—';if(motm)motm.textContent=s.motm||0;if(pts)pts.textContent=s.points||0;
    if(form)form.innerHTML=(s.formResults&&s.formResults.length?s.formResults:[]).map(x=>'<span class="'+(x==='W'?'win':x==='D'?'draw':'loss')+'">'+x+'</span>').join('')||'<span>Not played yet</span>';
  }

  function inject(){
    const home=document.getElementById('home');
    if(!home||document.getElementById('oms-daily-hub'))return;
    const hub=document.createElement('section');hub.id='oms-daily-hub';hub.className='panel oms-daily-hub';
    hub.innerHTML=`<div class="eyebrow">CAREER DAY · FC27-INSPIRED</div>
      <div class="daily-head"><div><h2 style="margin:6px 0">Daily Career Hub</h2><div class="muted" id="omsDailySubtitle">Your next decision is ready.</div></div><div class="daily-day" id="omsDailyBig">DAY 1</div></div>
      <div class="daily-grid">
        <div class="daily-main"><div class="daily-kicker" id="omsDailyType">TODAY</div><h3 id="omsDailyTitle">Training day</h3><p id="omsDailyText" class="muted">Choose how you spend the day.</p><div class="daily-actions"><button class="daily-btn primary" onclick="OMS_DAILY('focus')">FOCUS</button><button class="daily-btn" onclick="OMS_DAILY('recover')">RECOVER</button><button class="daily-btn" onclick="OMS_DAILY('social')">TEAM / MEDIA</button></div></div>
        <div class="daily-side"><div class="daily-kicker">NEXT 7 DAYS</div><div id="omsWeekStrip" class="week-strip"></div></div>
      </div>`;
    home.querySelector('.hero').insertAdjacentElement('afterend',hub);
    const cal=document.querySelector('#calendar')?.parentElement;
    if(cal){
      cal.innerHTML=`<h2>SEASON CALENDAR</h2><div class="muted">A rolling schedule with matchdays, training, recovery and story events.</div><div class="calendar-tools"><button class="daily-btn" onclick="OMS_SIM_DAYS(1)">NEXT DAY →</button><button class="daily-btn" onclick="OMS_SIM_DAYS(3)">+3 DAYS</button><button class="daily-btn" onclick="OMS_SIM_DAYS(7)">+7 DAYS</button></div><div class="pro-calendar" id="calendar"></div><div class="calendar-note" id="omsCalendarNote"></div>`;
    }
    addStyle();
  }

  function addStyle(){
    if(document.getElementById('oms-day-style'))return;
    const st=document.createElement('style');st.id='oms-day-style';st.textContent=`
      .oms-daily-hub{margin-top:18px;border-color:#2d6d91;background:linear-gradient(135deg,#071a29,#08131e 65%,#0b1d2a);overflow:hidden}
      .daily-head{display:flex;align-items:center;justify-content:space-between;gap:15px}.daily-day{font-size:26px;font-weight:950;color:#35c8ff;letter-spacing:-1px}
      .daily-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:14px;margin-top:16px}.daily-main,.daily-side{padding:16px;border:1px solid #1e4e6b;border-radius:13px;background:#071827}
      .daily-kicker{font-size:9px;letter-spacing:1.5px;font-weight:950;color:#7fd7ff}.daily-main h3{font-size:24px;margin:8px 0 4px}.daily-main p{max-width:560px;min-height:36px}
      .daily-actions{display:flex;gap:8px;flex-wrap:wrap}.daily-btn{border:1px solid #285873;background:#0c2436;color:#d8eaf7;border-radius:9px;padding:10px 13px;font-size:10px;font-weight:950;cursor:pointer}.daily-btn:hover{border-color:#4a91b8;transform:translateY(-1px)}.daily-btn.primary{background:#18c995;color:#03130f;border-color:#18c995}
      .week-strip{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:10px}.week-day{min-height:67px;padding:7px;border:1px solid #1a4058;border-radius:8px;background:#0a2030}.week-day strong{display:block;font-size:9px}.week-day span{display:block;font-size:16px;font-weight:950;margin-top:6px}.week-day small{display:block;color:#8faec7;font-size:8px;margin-top:4px}.week-day.today{border-color:#18d79b;background:#06362f}.week-day.match{box-shadow:inset 0 -2px #35c8ff}
      .calendar-tools{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0}.pro-calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}.cal-card{min-height:116px;padding:11px;border:1px solid #1c4b67;border-radius:11px;background:#071a29}.cal-card.today{border-color:#18d79b;background:#07352f}.cal-card.match{border-color:#35c8ff}.cal-card .date{font-size:9px;color:#86abc3}.cal-card b{display:block;margin-top:7px;font-size:12px}.cal-card p{font-size:9px;color:#8faec7;line-height:1.35;margin:7px 0}.cal-tag{display:inline-block;padding:4px 6px;border-radius:5px;font-size:8px;font-weight:950;background:#102f45;color:#9edaff}.cal-tag.match{background:#0a415c;color:#79d8ff}.cal-tag.event{background:#26311c;color:#c9ef83}.calendar-note{margin-top:10px;padding:10px;border-radius:8px;background:#081520;color:#8faec7;font-size:10px}
      @media(max-width:850px){.daily-grid{grid-template-columns:1fr}.pro-calendar{grid-template-columns:repeat(4,1fr)}}
      @media(max-width:600px){.daily-head{align-items:flex-start}.daily-day{font-size:20px}.week-strip{grid-template-columns:repeat(4,1fr)}.pro-calendar{grid-template-columns:repeat(2,1fr)}}`;
    document.head.appendChild(st);
  }

  function renderDaily(){
    const s=get();if(!s)return;ensure(s);
    const a=activityFor(s,s.day),opp=nextOpponent(s);
    const type=document.getElementById('omsDailyType'),title=document.getElementById('omsDailyTitle'),text=document.getElementById('omsDailyText'),big=document.getElementById('omsDailyBig'),sub=document.getElementById('omsDailySubtitle');
    if(type)type.textContent=a.type==='MATCH'?'MATCHDAY':'DAILY ACTIVITY';
    if(title)title.textContent=a.type==='MATCH'?`vs ${opp}`:a.title;
    if(text)text.textContent=a.type==='MATCH'?'Your matchday has arrived. Simulate the match to receive a full performance report.':a.text;
    if(big)big.textContent='DAY '+s.day;if(sub)sub.textContent=`${dayName(s.day)} · Season ${s.season} · Fitness ${Math.round(s.fitness)}% · Morale ${Math.round(s.morale)}%`;
    const strip=document.getElementById('omsWeekStrip');
    if(strip)strip.innerHTML=Array.from({length:7},(_,i)=>{const d=s.day+i,x=activityFor(s,d);return `<div class="week-day ${i===0?'today ':''}${x.type==='MATCH'?'match':''}"><strong>${dayName(d)}</strong><span>${d}</span><small>${x.type==='MATCH'?'⚽ Match':x.title}</small></div>`}).join('');
    const cal=document.getElementById('calendar');
    if(cal){cal.innerHTML=Array.from({length:14},(_,i)=>{const d=s.day+i,x=activityFor(s,d);return `<div class="cal-card ${i===0?'today ':''}${x.type==='MATCH'?'match':''}"><div class="date">${dayName(d)} · DAY ${d}</div><b>${x.type==='MATCH'?'⚽ '+opp:x.icon+' '+x.title}</b><p>${x.text}</p><span class="cal-tag ${x.type==='MATCH'?'match':'event'}">${x.type}</span></div>`}).join('');}
    const note=document.getElementById('omsCalendarNote');if(note)note.textContent=`Next match: Day ${s.day+(matchEvery(s.day)?0:(7-(s.day%7)+1)%7)} · The calendar updates after every simulation.`;
    renderMatch(s);
  }

  window.OMS_DAILY=function(mode){
    const s=get();if(!s)return;ensure(s);
    const a=activityFor(s,s.day);
    if(a.type==='MATCH'){window.simulateMatch();return;}
    if(mode==='focus'){s.sharp=Math.min(100,s.sharp+7);s.fitness=Math.max(35,s.fitness-3);s.morale=Math.min(100,s.morale+1);addLog(s,'Focused day','You prioritised development and sharpness.');}
    else if(mode==='recover'){s.fitness=Math.min(100,s.fitness+8);s.sharp=Math.max(35,s.sharp-1);addLog(s,'Recovery day','You protected your energy and prepared for the next match.');}
    else{s.morale=Math.min(100,s.morale+5);s.sharp=Math.min(100,s.sharp+1);addLog(s,'Team & media day','You built confidence with teammates and the media.');}
    s.day++;seasonCheck(s);save();if(typeof window.render==='function')window.render();renderDaily();if(typeof window.toast==='function')window.toast('DAY '+(s.day-1)+' COMPLETE');
  };
  window.OMS_SIM_DAYS=function(n){
    const s=get();if(!s)return;ensure(s);let matches=0;
    for(let i=0;i<n;i++){if(activityFor(s,s.day).type==='MATCH')matches++;simulateDay(s,true);seasonCheck(s)}
    save();if(typeof window.render==='function')window.render();renderDaily();if(typeof window.toast==='function')window.toast(`${n} DAYS SIMULATED · ${matches} MATCH${matches===1?'':'ES'}`);
  };

  const oldAdvance=window.advance;
  window.advance=function(n){window.OMS_SIM_DAYS(n)};
  const oldSim=window.simulateMatch;
  window.simulateMatch=function(){
    const s=get();if(!s)return;
    ensure(s);
    simulateDay(s,false);seasonCheck(s);save();
    if(typeof window.render==='function')window.render();
    renderDaily();
  };

  const oldRender=window.render;
  window.render=function(){
    if(oldRender)oldRender();
    renderDaily();
  };

  function boot(){inject();renderDaily()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
