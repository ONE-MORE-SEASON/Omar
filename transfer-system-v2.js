/* ONE MORE SEASON — Transfer System v2
   Player-career transfer layer. Designed to sit on top of the existing career state.
   It adds: coach requests, club interest, rumours, instant inbox alerts, offers,
   salary/fee visibility, loans, transfer decisions and fan/media reactions.
*/
(function(){
  'use strict';
  const CLUBS = [
    {name:'Real Madrid',league:'La Liga',ovr:88,stars:5,rep:98,salary:52000},
    {name:'FC Barcelona',league:'La Liga',ovr:86,stars:5,rep:96,salary:48000},
    {name:'Manchester City',league:'Premier League',ovr:89,stars:5,rep:99,salary:60000},
    {name:'Liverpool',league:'Premier League',ovr:86,stars:5,rep:96,salary:52000},
    {name:'Arsenal',league:'Premier League',ovr:85,stars:5,rep:94,salary:47000},
    {name:'Chelsea',league:'Premier League',ovr:83,stars:5,rep:91,salary:44000},
    {name:'Manchester United',league:'Premier League',ovr:82,stars:5,rep:92,salary:46000},
    {name:'Bayern Munich',league:'Bundesliga',ovr:88,stars:5,rep:98,salary:56000},
    {name:'Borussia Dortmund',league:'Bundesliga',ovr:82,stars:4,srep:90,rep:90,salary:39000},
    {name:'PSG',league:'Ligue 1',ovr:86,stars:5,rep:96,salary:50000},
    {name:'Inter',league:'Serie A',ovr:84,stars:5,rep:93,salary:43000},
    {name:'AC Milan',league:'Serie A',ovr:81,stars:4,rep:90,salary:36000},
    {name:'Juventus',league:'Serie A',ovr:82,stars:4,rep:92,salary:39000},
    {name:'Atletico Madrid',league:'La Liga',ovr:84,stars:5,rep:92,salary:41000},
    {name:'Aston Villa',league:'Premier League',ovr:78,stars:4,rep:84,salary:30000},
    {name:'Real Sociedad',league:'La Liga',ovr:74,stars:3,rep:76,salary:22000},
    {name:'Villarreal',league:'La Liga',ovr:75,stars:3,rep:78,salary:23000},
    {name:'BK Häcken',league:'Allsvenskan',ovr:69,stars:3,rep:61,salary:9000}
  ];
  const COMMENTS = {
    positive:['Fans love the move.','Supporters see this as a statement signing.','The transfer looks like a smart career step.'],
    neutral:['Fans are waiting to see how it works out.','Supporters are split on the move.','The reaction is cautious but interested.'],
    negative:['Some fans question the transfer.','Supporters are worried about playing time.','The move has divided opinion online.']
  };
  const key='OMS_TRANSFER_V2';
  function money(n){return '€'+Math.round(Number(n||0)).toLocaleString('en-US')+'/week'}
  function fee(n){return '€'+Math.round(Number(n||0)).toLocaleString('en-US')}
  function getState(){
    if(window.state&&typeof window.state==='object') return window.state;
    try{
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i),v=localStorage.getItem(k); if(!v||v[0]!=='{') continue;
        const o=JSON.parse(v); if(o&&((o.name&&o.club)||(o.playerName&&o.club))) return o;
      }
    }catch(e){}
    return null;
  }
  function load(){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
  function save(d){try{localStorage.setItem(key,JSON.stringify(d))}catch(e){}; if(window.saveGame)try{window.saveGame()}catch(e){}}
  function toast(t){if(window.toast)window.toast(t);else{const el=document.querySelector('.toast');if(el){el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3500)}}}
  function data(){
    let d=load(); if(!d)d={inbox:[],offers:[],rumours:[],history:[],reactions:[],coachTrust:55,loanInterest:[],lastDay:0};
    return d;
  }
  function player(){const s=getState()||{};return {name:s.name||s.playerName||'Your player',club:s.club||'Current Club',ovr:Number(s.ovr||67),age:Number(s.age||17),position:s.pos||s.position||'ST',day:Number(s.day||1),season:Number(s.season||1)}}
  function eligible(c,p){return c.name!==p.club && c.ovr>=Math.max(60,p.ovr-8) && c.ovr<=p.ovr+10}
  function createInterest(){
    const p=player(),d=data(),pool=CLUBS.filter(c=>eligible(c,p));
    if(!pool.length)return null;
    const c=pool[Math.floor(Math.random()*pool.length)], level=c.ovr>=p.ovr+5?'strong':c.ovr>=p.ovr-1?'medium':'early';
    const item={id:'i'+Date.now(),club:c.name,league:c.league,level,day:p.day,read:false,type:'interest'};
    d.inbox.unshift({id:item.id,type:'interest',day:p.day,title:c.name+' are monitoring you',body:'Scouts have added you to their shortlist. The club is considering a future approach.',club:c.name,read:false});
    d.rumours.unshift({day:p.day,headline:p.name+' linked with '+c.name,source:'Transfer Desk',club:c.name,level});
    d.reactions.unshift({day:p.day,club:c.name,tone:'neutral',text:COMMENTS.neutral[Math.floor(Math.random()*COMMENTS.neutral.length)]});
    d.lastDay=p.day;save(d);return c;
  }
  function offerClub(c,loan){
    const p=player(),d=data(),feeValue=Math.max(250000,Math.round((p.ovr*p.ovr*95)*(c.ovr/75)));
    const salary=Math.max(3500,Math.round(c.salary*(.72+Math.random()*.5)));
    const offer={id:'o'+Date.now(),club:c.name,league:c.league,fee:feeValue,salary,loan,years:loan?1:Math.random()<.7?3:4,day:p.day,status:'pending'};
    d.offers.unshift(offer);d.inbox.unshift({id:offer.id,type:loan?'loan':'offer',day:p.day,title:(loan?'Loan offer from ':'Transfer offer from ')+c.name,body:loan?'They want to take you on a season-long loan.':'The club wants to sign you permanently.',club:c.name,read:false});
    d.rumours.unshift({day:p.day,headline:(loan?'Loan talks: ':'Transfer talks: ')+p.name+' → '+c.name,source:'Transfer Desk',club:c.name,level:'strong'});
    const tone=c.ovr>=p.ovr?'positive':'neutral';d.reactions.unshift({day:p.day,club:c.name,tone,text:COMMENTS[tone][Math.floor(Math.random()*COMMENTS[tone].length)]});
    save(d);toast('New '+(loan?'loan':'transfer')+' offer — '+c.name);showMail(d.inbox[0]);return offer;
  }
  function showMail(m){
    let el=document.getElementById('omsTransferMailOverlay');if(!el){el=document.createElement('div');el.id='omsTransferMailOverlay';el.className='oms-transfer-overlay';document.body.appendChild(el)}
    el.innerHTML=`<div class="oms-transfer-mail"><div class="oms-transfer-mailtop"><span>✉ TRANSFER INBOX</span><button onclick="window.OMS_TRANSFER.closeMail()">×</button></div><div class="eyebrow">NEW CAREER MESSAGE · DAY ${m.day}</div><h2>${m.title}</h2><p>${m.body}</p><div class="oms-transfer-mailactions"><button class="action" onclick="window.OMS_TRANSFER.openTransfers()">OPEN TRANSFER CENTRE</button><button class="action secondary" onclick="window.OMS_TRANSFER.closeMail()">READ LATER</button></div></div>`;
    el.style.display='grid';
  }
  function closeMail(){const e=document.getElementById('omsTransferMailOverlay');if(e)e.style.display='none';const d=data();if(d.inbox[0])d.inbox[0].read=true;save(d)}
  function requestMove(){
    const p=player(),d=data();d.coachRequest={day:p.day,status:'pending'};d.inbox.unshift({id:'c'+Date.now(),type:'coach',day:p.day,title:'Meeting request sent to your manager',body:'You have asked the coach about your future. They will respond when a decision is made.',read:false});save(d);toast('Coach meeting request sent');render();
  }
  function requestLoan(){
    const p=player(),d=data();d.loanRequest={day:p.day,status:'pending'};d.inbox.unshift({id:'l'+Date.now(),type:'loanRequest',day:p.day,title:'Loan request submitted',body:'Your agent will look for suitable clubs where you can get regular minutes.',read:false});save(d);toast('Loan request submitted');render();
  }
  function decide(id,choice){
    const d=data(),o=d.offers.find(x=>x.id===id);if(!o)return;
    if(choice==='accept'){const old=player().club;o.status='accepted';d.history.unshift({day:o.day,from:old,to:o.club,type:o.loan?'loan':'transfer',fee:o.fee,salary:o.salary});if(window.state)window.state.club=o.club;toast('Transfer accepted: '+o.club)}
    else if(choice==='reject'){o.status='rejected';toast('Offer rejected')}
    else {o.status='negotiating';o.salary=Math.round(o.salary*1.08);toast('Counter proposal sent')}
    save(d);render();
  }
  function openTransfers(){closeMail();const b=document.querySelector('#nav button[data-view="transfers"]');if(b)b.click();else{const v=document.getElementById('transfers');if(v){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));v.classList.add('active')}};render()}
  function stars(n){return '★'.repeat(Math.max(1,Math.min(5,Number(n||1))))+'☆'.repeat(5-Math.max(1,Math.min(5,Number(n||1))))}
  function render(){
    const root=document.getElementById('transfers');if(!root)return;const p=player(),d=data(),unread=d.inbox.filter(x=>!x.read).length;
    root.innerHTML=`<div class="oms-transfer-head"><div><div class="eyebrow">CAREER MARKET · TRANSFERS</div><h1>Transfer Centre</h1><div class="muted">Talk to your coach, follow rumours, compare offers and control your next move.</div></div><span class="oms-transfer-status">${unread?unread+' NEW MESSAGE'+(unread===1?'':'S'): 'INBOX CLEAR'}</span></div>
    <div class="oms-transfer-grid">
      <section class="panel oms-transfer-overview"><div class="eyebrow">YOUR MARKET PROFILE</div><div class="oms-transfer-kpis"><div><small>PLAYER</small><b>${p.name}</b></div><div><small>CLUB</small><b>${p.club}</b></div><div><small>OVR</small><b>${p.ovr}</b></div><div><small>VALUE</small><b>${fee(Math.max(250000,p.ovr*p.ovr*95))}</b></div></div>
      <div class="oms-transfer-coach"><div><div class="eyebrow">COACH CONVERSATION</div><h3>Want a move?</h3><p class="muted">Ask the coach about your future or request a loan to find more playing time.</p></div><div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end"><button class="action" onclick="OMS_TRANSFER.requestMove()">ASK COACH</button><button class="action secondary" onclick="OMS_TRANSFER.requestLoan()">REQUEST LOAN</button></div></div></section>
      <section class="panel"><div class="oms-transfer-section-title"><h2>Transfer Inbox</h2><span class="oms-transfer-count">${d.inbox.length}</span></div><div class="oms-transfer-inbox">${d.inbox.slice(0,7).map(m=>`<article class="oms-transfer-message ${m.read?'':'unread'}"><div><span class="oms-transfer-type ${m.type==='loan'?'loan':''}">${m.type}</span><small>DAY ${m.day}</small></div><b>${m.title}</b><p>${m.body}</p><button class="action secondary" style="width:auto;margin-top:9px" onclick='OMS_TRANSFER.openMail(${JSON.stringify(m).replace(/'/g,"&#39;")})'>OPEN MESSAGE</button></article>`).join('')||'<div class="oms-transfer-empty">No messages yet. Play through the season and the transfer market will react to your performances.</div>'}</div></section>
      <section class="panel"><div class="oms-transfer-section-title"><h2>Offers</h2><span class="oms-transfer-count">${d.offers.length}</span></div><div class="oms-transfer-offers">${d.offers.slice(0,6).map(o=>`<article class="oms-transfer-offer"><div class="oms-transfer-offer-head"><div><span class="oms-transfer-type ${o.loan?'loan':''}">${o.loan?'LOAN':'TRANSFER'}</span><h3>${o.club}</h3><small>${o.league} · ${stars((CLUBS.find(c=>c.name===o.club)||{}).stars||3)}</small></div><strong class="oms-transfer-fee">${fee(o.fee)}<small>${money(o.salary)}</small></strong></div><div class="oms-transfer-terms"><div><small>CONTRACT</small><b>${o.years} yrs</b></div><div><small>STATUS</small><b>${o.status}</b></div><div><small>DAY</small><b>${o.day}</b></div></div><div class="oms-transfer-actions">${o.status==='pending'?`<button class="action" onclick="OMS_TRANSFER.decide('${o.id}','accept')">ACCEPT</button><button class="action secondary" onclick="OMS_TRANSFER.decide('${o.id}','negotiate')">NEGOTIATE</button><button class="action secondary" onclick="OMS_TRANSFER.decide('${o.id}','reject')">REJECT</button>`:'<span class="muted">Decision recorded.</span>'}</div></article>`).join('')||'<div class="oms-transfer-empty">No offers yet. Strong form and good performances increase interest.</div>'}</div></section>
      <section class="panel oms-transfer-block"><div class="oms-transfer-section-title"><h2>Transfer Rumours</h2><span class="muted">Latest</span></div><div class="oms-transfer-list">${d.rumours.slice(0,8).map(r=>`<article><div><b>${r.headline}</b><small>${r.source} · Day ${r.day}</small></div><span class="oms-transfer-rumour">RUMOUR</span></article>`).join('')||'<div class="oms-transfer-empty">No credible rumours yet.</div>'}</div></section>
      <section class="panel oms-transfer-block"><div class="oms-transfer-section-title"><h2>What people think</h2><span class="muted">Fans · media · analysts</span></div><div class="oms-transfer-reactions">${d.reactions.slice(0,8).map(r=>`<article class="${r.tone}"><span>${r.tone.toUpperCase()}</span><div><b>${r.club}</b><p>${r.text}</p></div><small>DAY ${r.day}</small></article>`).join('')||'<div class="oms-transfer-empty">Public reaction appears when a club becomes interested in you.</div>'}</div></section>
    </div>`;
    const nav=document.getElementById('nav');if(nav){const b=nav.querySelector('button[data-view="transfers"]');if(b){b.classList.toggle('oms-transfer-unread',unread>0);b.dataset.unread=unread}}}
  window.OMS_TRANSFER={render,requestMove,requestLoan,decide,closeMail,openTransfers,openMail:function(m){const d=data();const x=d.inbox.find(v=>v.id===m.id)||m;showMail(x)}};
  function hook(){render();
    const oldAdvance=window.advance;if(oldAdvance&&!oldAdvance.__transferHook){const wrapped=function(n){const before=player().day;const result=oldAdvance.apply(this,arguments);setTimeout(()=>{const after=player().day;if(after>before){const p=player();if(p.day%12===0||Math.random()<.12)createInterest();render()}},0);return result};wrapped.__transferHook=true;window.advance=wrapped}
    const oldMatch=window.simulateMatch;if(oldMatch&&!oldMatch.__transferHook){const wrapped=function(){const result=oldMatch.apply(this,arguments);setTimeout(()=>{if(Math.random()<.22)createInterest();render()},0);return result};wrapped.__transferHook=true;window.simulateMatch=wrapped}
    const unread=data().inbox.find(x=>!x.read);if(unread&&window.__OMS_TRANSFER_ALERTED!==unread.id){window.__OMS_TRANSFER_ALERTED=unread.id;setTimeout(()=>showMail(unread),700)}
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(hook,350));
  window.addEventListener('load',()=>setTimeout(hook,600));
})();
