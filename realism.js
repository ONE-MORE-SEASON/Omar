/* ONE MORE SEASON — Realism Pack v1 */
(() => {
  'use strict';
  if (window.__OMS_REALISM_V1__) return;
  window.__OMS_REALISM_V1__ = true;

  const KEY = 'omsCareerStable3';
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const num = (v,d=0) => Number.isFinite(Number(v)) ? Number(v) : d;
  const esc = s => String(s ?? '').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const get = () => typeof window.OMS_GET_STATE === 'function' ? window.OMS_GET_STATE() : window.state;
  const saveNow = () => { try { if (typeof window.save === 'function') window.save(); else localStorage.setItem(KEY,JSON.stringify(get())); } catch(e){} };
  const toast = msg => { if (typeof window.toast === 'function') window.toast(msg); };

  const managers = [
    ['Martin Sjöberg','Balanced','rotation and form'],
    ['David Carter','Development','young players and training'],
    ['Marco Bianchi','Tactical','position and discipline']
  ];
  const transferTargets = [
    ['Brighton','Premier League',76],['Real Sociedad','La Liga',74],['Villarreal','La Liga',75],['Feyenoord','Eredivisie',75],
    ['Lille','Ligue 1',74],['Bologna','Serie A',73],['Sporting CP','Primeira Liga',77],['Borussia Dortmund','Bundesliga',82],
    ['RB Leipzig','Bundesliga',80],['Benfica','Primeira Liga',79],['Marseille','Ligue 1',76],['Aston Villa','Premier League',78]
  ];

  function ensure(s){
    if(!s) return;
    s.apps=num(s.apps); s.goals=num(s.goals); s.assists=num(s.assists);
    s.motm=num(s.motm); s.ratingTotal=num(s.ratingTotal);
    s.minutes=num(s.minutes); s.starts=num(s.starts); s.subApps=num(s.subApps);
    s.benchApps=num(s.benchApps); s.managerTrust=clamp(num(s.managerTrust,60),0,100);
    s.reputation=clamp(num(s.reputation,20),0,100); s.wage=num(s.wage,500);
    s.contractYears=num(s.contractYears,3); s.injuredDays=num(s.injuredDays);
    s.trainingLoad=num(s.trainingLoad); s.careerEvents=Array.isArray(s.careerEvents)?s.careerEvents:[];
    s.seasonArchive=Array.isArray(s.seasonArchive)?s.seasonArchive:[];
    s.transferOffers=Array.isArray(s.transferOffers)?s.transferOffers:[];
    s.nationalCaps=num(s.nationalCaps); s.nationalGoals=num(s.nationalGoals);
    if(!s.manager){ const m=managers[Math.abs(num(s.season,1))%managers.length]; s.manager=m[0]; s.managerStyle=m[1]; }
  }

  function record(title,detail){
    const s=get(); if(!s)return; ensure(s);
    s.careerEvents.push({title,detail,day:num(s.day,1),season:num(s.season,1)});
    s.careerEvents=s.careerEvents.slice(-40); saveNow();
  }

  function playerRating(){
    const s=get(); if(!s)return 67;
    return clamp(num(s.ovr,67)+((num(s.reputation)-35)/70)+((num(s.managerTrust)-60)/120),55,99);
  }

  function chooseRole(s){
    const ovr=num(s.ovr,67), trust=num(s.managerTrust,60), sharp=num(s.sharp,85), route=s.startingRoute;
    if(route==='starter' && ovr>=64 && trust>=55)return 'STARTER';
    if(route==='loan')return 'LOAN PATH';
    if(route==='bench')return 'BENCH';
    if(ovr>=76 && trust>=72 && sharp>=75)return 'STARTER';
    if(ovr>=69 && trust>=58)return 'ROTATION';
    return 'BENCH';
  }

  function simulateMinutes(s, matchRating){
    const role=chooseRole(s), fitness=num(s.fitness,90), sharp=num(s.sharp,80), trust=num(s.managerTrust,60);
    if(num(s.injuredDays)>0)return {role:'INJURED',minutes:0,start:false};
    let start=role==='STARTER' || (role==='ROTATION' && Math.random()<0.55);
    let minutes=start ? 62+Math.floor(Math.random()*29) : 12+Math.floor(Math.random()*31);
    if(fitness<55)minutes=Math.max(8,minutes-18);
    if(sharp<55)minutes=Math.max(8,minutes-12);
    if(trust<45)minutes=Math.max(0,minutes-15);
    if(matchRating<5.5)minutes=Math.max(0,minutes-10);
    return {role:start?'STARTER':'SUBSTITUTE',minutes,start};
  }

  function applyMatchRealism(){
    const s=get(); if(!s)return; ensure(s);
    const last=Array.isArray(s.matchHistory)?s.matchHistory[0]:null;
    if(!last)return;
    const rating=num(last.rating,6.5);
    const role=simulateMinutes(s,rating);
    s.role=role.role; s.minutes+=role.minutes;
    if(role.minutes>0){s.apps++; if(role.start)s.starts++; else s.subApps++;}
    else s.benchApps++;
    if(num(last.goals)>0)s.goals+=num(last.goals);
    if(num(last.assists)>0)s.assists+=num(last.assists);
    s.ratingTotal+=rating;
    if(last.motm)s.motm++;
    const result=last.outcome;
    s.managerTrust=clamp(s.managerTrust+(rating>=7.5?2:rating<5.8?-2:0)+(role.start?1:0),0,100);
    s.reputation=clamp(s.reputation+(rating>=8?2:rating>=7?1:0)+(last.motm?2:0),0,100);
    if(result==='W')s.morale=clamp(num(s.morale,78)+2,0,100);
    else if(result==='L')s.morale=clamp(num(s.morale,78)-2,0,100);

    const workload=(role.minutes/90)*10;
    s.trainingLoad=clamp(num(s.trainingLoad)+workload,0,100);
    if(role.minutes>=75 && Math.random()<0.035){s.injuredDays=2+Math.floor(Math.random()*6);record('Injury','A small knock keeps '+s.name+' out for '+s.injuredDays+' days.');toast('Injury: '+s.injuredDays+' days');}
    else if(num(s.fitness)<48 && Math.random()<0.08){s.injuredDays=3+Math.floor(Math.random()*8);record('Injury','Fatigue forces a short spell on the sidelines.');toast('Fatigue injury');}

    if(rating>=8.2 && s.ovr<99 && Math.random()<0.12){s.ovr++;record('Development','Strong performances have improved '+s.name+' to OVR '+s.ovr+'.');}
    if(rating<5.5 && s.managerTrust<45)toast('Manager trust is falling — improve your next performances.');

    maybeTransferOffer(s);
    maybeNationalTeam(s,rating);
    saveNow();
  }

  function maybeTransferOffer(s){
    if(num(s.reputation)<38 || num(s.season,1)<1 || s.transferOffers.length>=3)return;
    if(Math.random()>0.09)return;
    const available=transferTargets.filter(x=>x[0]!==s.club && !s.transferOffers.some(o=>o.club===x[0]));
    if(!available.length)return;
    const t=available[Math.floor(Math.random()*available.length)];
    const level=num(s.ovr,67), fit=level>=t[2]-5 && level<=t[2]+8;
    if(!fit && Math.random()<0.65)return;
    const wage=Math.round((num(s.wage,500)*(0.9+Math.random()*1.8))/50)*50;
    s.transferOffers.push({club:t[0],league:t[1],wage,years:3,day:s.day,season:s.season});
    record('Transfer interest',t[0]+' have opened talks about '+s.name+'. Proposed wage: €'+wage+'k/week.');
    toast('Transfer interest from '+t[0]);
  }

  function maybeNationalTeam(s,rating){
    if(num(s.ovr)<78 || num(s.reputation)<48 || Math.random()>0.025)return;
    s.nationalTeam=s.nationalTeam||s.nation;
    if(Math.random()<0.65){s.nationalCaps++;if(num(s.goals)>0&&Math.random()<0.25)s.nationalGoals++;record('National team','Called up for '+s.nationalTeam+'.');toast('National team call-up!');}
  }

  function renderProfile(){
    const s=get(); if(!s)return; ensure(s);
    const host=document.getElementById('squad'); if(!host)return;
    let box=document.getElementById('omsRealismSquad');
    if(!box){box=document.createElement('div');box.id='omsRealismSquad';box.className='panel';host.appendChild(box)}
    const role=chooseRole(s);
    box.innerHTML='<div class="eyebrow">PLAYER CAREER · SQUAD ROLE</div><h2>'+esc(s.role||role)+'</h2><div class="cards">'+
      '<div class="card"><div class="eyebrow">MANAGER</div><h3>'+esc(s.manager)+'</h3><p class="muted">'+esc(s.managerStyle)+' · Trust '+Math.round(s.managerTrust)+'%</p></div>'+
      '<div class="card"><div class="eyebrow">MINUTES</div><h3>'+s.minutes+'</h3><p class="muted">'+s.starts+' starts · '+s.subApps+' substitute appearances</p></div>'+
      '<div class="card"><div class="eyebrow">REPUTATION</div><h3>'+Math.round(s.reputation)+'</h3><p class="muted">Higher reputation unlocks stronger opportunities.</p></div></div>';
  }

  function renderTransfers(){
    const s=get(); if(!s)return; ensure(s);
    const host=document.getElementById('transfers'); if(!host)return;
    let box=document.getElementById('omsRealismTransfers');
    if(!box){box=document.createElement('div');box.id='omsRealismTransfers';box.className='panel';host.appendChild(box)}
    const offers=s.transferOffers;
    box.innerHTML='<div class="eyebrow">PLAYER CAREER · REALISTIC MARKET</div><h2>CLUB INTEREST</h2>'+(
      offers.length ? offers.slice().reverse().map((o,i)=>'<div class="card" style="margin-top:10px"><b>'+esc(o.club)+'</b><p class="muted">'+esc(o.league)+' · €'+o.wage+'k/week · '+o.years+' years</p><button class="action" onclick="OMS_ACCEPT_OFFER('+i+')">ACCEPT INTEREST →</button></div>').join('') : '<p class="muted">No offers yet. Improve performances and reputation to attract clubs.</p>');
  }

  window.OMS_ACCEPT_OFFER=function(reverseIndex){
    const s=get();if(!s)return;ensure(s);
    const offers=s.transferOffers.slice().reverse();const o=offers[reverseIndex];if(!o)return;
    s.club=o.club;s.wage=o.wage;s.contractYears=o.years;s.transferOffers=[];s.managerTrust=55;s.role='ROTATION';
    record('Transfer completed',''+s.name+' joins '+s.club+' on a €'+s.wage+'k/week contract.');
    saveNow(); if(typeof window.render==='function')window.render();renderTransfers();renderProfile();toast('Transfer completed: '+s.club);
  };

  function renderAgent(){
    const s=get();if(!s)return;ensure(s);
    const host=document.getElementById('agent');if(!host)return;
    let box=document.getElementById('omsRealismAgent');
    if(!box){box=document.createElement('div');box.id='omsRealismAgent';box.className='panel';host.appendChild(box)}
    box.innerHTML='<div class="eyebrow">CONTRACT</div><h2>'+esc(s.club)+'</h2><div class="cards"><div class="card"><div class="eyebrow">WEEKLY WAGE</div><h3>€'+s.wage+'k</h3></div><div class="card"><div class="eyebrow">CONTRACT</div><h3>'+s.contractYears+' years</h3></div><div class="card"><div class="eyebrow">MARKET VALUE</div><h3>€'+Math.max(1,Math.round((num(s.ovr,67)*num(s.ovr,67)*0.025+num(s.reputation)*0.3)))+'m</h3></div></div><p class="muted">Your value changes with OVR, reputation and performances.</p>';
  }

  function renderWorld(){
    const s=get();if(!s)return;ensure(s);
    const host=document.getElementById('world');if(!host)return;
    let box=document.getElementById('omsRealismWorld');
    if(!box){box=document.createElement('div');box.id='omsRealismWorld';box.className='panel';host.appendChild(box)}
    const events=[];
    if(num(s.injuredDays)>0)events.push('🩹 '+s.name+' is unavailable for '+s.injuredDays+' days.');
    events.push('📰 Manager '+s.manager+' is monitoring your recent form.');
    if(num(s.reputation)>=50)events.push('👀 Scouts are tracking your performances.');
    if(s.transferOffers.length)events.push('🔄 '+s.transferOffers.length+' club interest offer'+(s.transferOffers.length>1?'s':'')+' available.');
    if(num(s.nationalCaps)>0)events.push('🌍 '+s.nationalTeam+': '+s.nationalCaps+' caps.');
    box.innerHTML='<div class="eyebrow">FOOTBALL WORLD</div><h2>WHAT IS HAPPENING AROUND YOU</h2><div class="news">'+events.map(e=>'<div>'+e+'</div>').join('')+'</div>';
  }

  function renderHistory(){
    const s=get();if(!s)return;ensure(s);
    const host=document.getElementById('history');if(!host)return;
    let box=document.getElementById('omsRealismHistory');
    if(!box){box=document.createElement('div');box.id='omsRealismHistory';box.className='panel';host.appendChild(box)}
    const avg=s.apps?(s.ratingTotal/s.apps).toFixed(1):'—';
    box.innerHTML='<div class="eyebrow">CAREER LEGACY</div><h2>CAREER RECORD</h2><div class="cards">'+
      '<div class="card"><div class="eyebrow">APPEARANCES</div><h3>'+s.apps+'</h3></div><div class="card"><div class="eyebrow">GOALS</div><h3>'+s.goals+'</h3></div><div class="card"><div class="eyebrow">ASSISTS</div><h3>'+s.assists+'</h3></div><div class="card"><div class="eyebrow">AVG RATING</div><h3>'+avg+'</h3></div></div><p class="muted">National team: '+esc(s.nationalTeam||s.nation)+' · '+s.nationalCaps+' caps · '+s.nationalGoals+' goals</p>';
  }

  function tickDay(){
    const s=get();if(!s)return;ensure(s);
    if(num(s.injuredDays)>0)s.injuredDays--;
    s.trainingLoad=clamp(num(s.trainingLoad)-3,0,100);
    if(num(s.injuredDays)===0 && num(s.fitness)<60)s.fitness=clamp(num(s.fitness)+2,0,100);
    if(num(s.contractYears)<=0){s.contractYears=1;record('Contract','Your contract is entering its final year.');}
  }

  const oldBegin=window.beginCareer;
  window.beginCareer=function(){
    oldBegin.apply(this,arguments);
    const s=get();if(!s)return;ensure(s);
    s.wage=s.wage||500;s.contractYears=s.contractYears||3;s.managerTrust=60;s.reputation=20;s.minutes=0;s.starts=0;s.subApps=0;s.benchApps=0;s.nationalCaps=0;s.nationalGoals=0;s.transferOffers=[];s.trainingLoad=0;s.injuredDays=0;
    record('Career started',s.name+' begins at '+s.club+' as a '+s.pos+'.');
    saveNow();renderAll();
  };

  const oldSim=window.simulateMatch;
  window.simulateMatch=function(){
    const s=get();if(!s)return;
    ensure(s);
    if(num(s.injuredDays)>0){toast('Unavailable: '+s.injuredDays+' days injured');return;}
    oldSim.apply(this,arguments);
    applyMatchRealism();
    tickDay();
    saveNow();renderAll();
  };

  const oldAdvance=window.advance;
  window.advance=function(n){
    const s=get();if(!s)return;
    ensure(s);
    const days=Math.max(1,Math.min(365,Math.floor(num(n,1))));
    for(let i=0;i<days;i++)tickDay();
    oldAdvance.call(this,days);
    ensure(get());
    if(num(s.reputation)>=35 && Math.random()<0.08)maybeTransferOffer(s);
    saveNow();renderAll();
  };

  const oldCheck=window.checkSeason;
  if(oldCheck)window.checkSeason=function(){
    const s=get();if(!s)return;ensure(s);const before=num(s.season,1);oldCheck.apply(this,arguments);
    if(num(s.season,1)>before){
      s.seasonArchive.push({season:before,apps:s.apps,goals:s.goals,assists:s.assists,avg:s.apps?(s.ratingTotal/s.apps).toFixed(1):'—',club:s.club});
      s.seasonArchive=s.seasonArchive.slice(-10);
      s.apps=0;s.goals=0;s.assists=0;s.motm=0;s.ratingTotal=0;s.minutes=0;s.starts=0;s.subApps=0;s.form=[];
      s.fitness=90;s.sharp=85;s.managerTrust=clamp(s.managerTrust+3,0,100);record('New season','Season '+s.season+' begins at '+s.club+'.');saveNow();
    }
  };

  const oldRender=window.render;
  window.render=function(){if(oldRender)oldRender.apply(this,arguments);renderAll();};

  function renderAll(){
    const s=get();if(!s)return;ensure(s);
    setTimeout(()=>{renderProfile();renderTransfers();renderAgent();renderWorld();renderHistory();},0);
  }
  setTimeout(renderAll,100);
})();
