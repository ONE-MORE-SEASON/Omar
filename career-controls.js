/* ONE MORE SEASON — Clean Career Hub + Competition Center v2 */
(() => {
  'use strict';
  if(window.__OMS_CLEAN_HUB__)return;
  window.__OMS_CLEAN_HUB__=true;

  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const get=()=>window.state||{};
  const club=()=>get().club||get().team||document.querySelector('#club')?.value||'Hillcrest Academy';
  const comps=[
    ['Premier League','England',['Arsenal','Chelsea','Liverpool','Manchester City','Manchester United','Tottenham','Aston Villa','Newcastle United','West Ham United','Brighton','Crystal Palace','Everton','Fulham','Wolverhampton','Brentford','Nottingham Forest','Bournemouth','Leicester City']],
    ['La Liga','Spain',['Real Madrid','Barcelona','Atlético Madrid','Athletic Club','Real Sociedad','Villarreal','Real Betis','Sevilla','Valencia','Girona','Getafe','Celta Vigo','Osasuna','Mallorca','Rayo Vallecano','Alavés','Las Palmas','Espanyol']],
    ['Bundesliga','Germany',['Bayern Munich','Borussia Dortmund','Bayer Leverkusen','RB Leipzig','VfB Stuttgart','Wolfsburg','Eintracht Frankfurt','SC Freiburg','Hoffenheim','Union Berlin','Mainz 05','Werder Bremen','Borussia Mönchengladbach','Augsburg','Heidenheim','St. Pauli','Holstein Kiel']],
    ['Serie A','Italy',['Inter','AC Milan','Juventus','Napoli','Roma','Lazio','Atalanta','Fiorentina','Bologna','Torino','Genoa','Monza','Udinese','Parma','Cagliari','Como','Lecce','Empoli','Verona','Venezia']],
    ['Ligue 1','France',['Paris Saint-Germain','Marseille','Lille','Monaco','Lyon','Nice','Lens','Rennes','Strasbourg','Nantes','Montpellier','Toulouse','Brest','Reims','Auxerre','Saint-Étienne','Le Havre','Angers']],
    ['Eredivisie','Netherlands',['Ajax','PSV Eindhoven','Feyenoord','AZ Alkmaar','Twente','Utrecht','Groningen','Heerenveen','NEC Nijmegen','Sparta Rotterdam','Go Ahead Eagles','Fortuna Sittard','PEC Zwolle','Heracles','NAC Breda','Willem II']],
    ['Primeira Liga','Portugal',['Benfica','Porto','Sporting CP','Braga','Vitória SC','Boavista','Famalicão','Gil Vicente','Rio Ave','Estoril','Arouca','Casa Pia','Moreirense','Nacional','Farense','Santa Clara']],
    ['Süper Lig','Türkiye',['Galatasaray','Fenerbahçe','Beşiktaş','Trabzonspor','Başakşehir','Kasımpaşa','Antalyaspor','Samsunspor','Alanyaspor','Rizespor','Konyaspor','Kayserispor','Gaziantep','Sivasspor','Göztepe','Eyüpspor']],
    ['Brasileirão','Brazil',['Flamengo','Palmeiras','Atlético Mineiro','Botafogo','Fluminense','São Paulo','Corinthians','Grêmio','Internacional','Cruzeiro','Bahia','Fortaleza','Vasco da Gama','Athletico Paranaense','Bragantino','Santos']],
    ['MLS','USA',['Inter Miami','LAFC','Vancouver Whitecaps','LA Galaxy','Seattle Sounders','Atlanta United','New York City FC','New York Red Bulls','Columbus Crew','FC Cincinnati','Orlando City','Austin FC','Dallas','Houston Dynamo','Toronto FC','CF Montréal']],
    ['Saudi Pro League','Saudi Arabia',['Al-Hilal','Al Nassr','Al-Ahli','Al-Ittihad','Al-Ettifaq','Al-Shabab','Al-Qadsiah','Al-Taawoun','Al-Fateh','Al-Raed','Damac','Al-Khaleej','Al-Wehda','Al-Okhdood','Al-Fayha','Al-Riyadh']],
    ['Scottish Premiership','Scotland',['Celtic','Rangers','Aberdeen','Hearts','Hibernian','Motherwell','Dundee United','Dundee','St Mirren','Ross County','Kilmarnock','St Johnstone']],
    ['Belgian Pro League','Belgium',['Club Brugge','Anderlecht','Genk','Gent','Antwerp','Standard Liège','Union SG','Mechelen','Charleroi','Cercle Brugge','Westerlo','OH Leuven','Sint-Truiden','Kortrijk','Dender','Beerschot']],
    ['Croatian First Football League','Croatia',['Dinamo Zagreb','Hajduk Split','Rijeka','Osijek','Lokomotiva Zagreb','Gorica','Varaždin','Istra 1961','Šibenik','Slaven Belupo']],
    ['Austrian Bundesliga','Austria',['Red Bull Salzburg','Sturm Graz','Rapid Wien','Austria Wien','LASK','Wolfsberger AC','Austria Klagenfurt','Hartberg','Altach','Blau-Weiß Linz','Grazer AK','WSG Tirol']]
  ];
  const cups=['UEFA Champions League','UEFA Europa League','UEFA Conference League','FA Cup','Copa del Rey','DFB-Pokal','Coppa Italia','Coupe de France','KNVB Cup','Taça de Portugal','Türkiye Cup','Copa do Brasil','U.S. Open Cup','King Cup'];

  function css(){if(document.getElementById('omsCleanStyles'))return;const s=document.createElement('style');s.id='omsCleanStyles';s.textContent=`
    .oms-simbar{margin:18px 0 14px;padding:16px 18px;border:1px solid #245d7f;border-radius:16px;background:linear-gradient(135deg,#081d2e,#06131f);box-shadow:0 12px 35px #0005}
    .oms-simhead{display:flex;align-items:center;justify-content:space-between;gap:12px}.oms-simtitle{font-size:18px;font-weight:950}.oms-simday{font-size:24px;font-weight:950;color:#35c8ff}.oms-simsub{color:#8faec7;font-size:11px;margin-top:4px}
    .oms-simcontrols{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}.oms-simbtn{border:1px solid #285873;background:#0b2437;color:#dcecf7;border-radius:8px;padding:9px 12px;font-size:10px;font-weight:950;cursor:pointer}.oms-simbtn:hover{border-color:#35c8ff;transform:translateY(-1px)}.oms-simbtn.primary{background:#18d79b;color:#03140f;border-color:#18d79b}.oms-custom{display:flex;gap:6px;margin-left:auto}.oms-custom input{width:75px;padding:9px;border-radius:8px;border:1px solid #285873;background:#071622;color:#fff;font-size:11px}
    .oms-simnote{margin-top:10px;padding:8px 10px;border-radius:8px;background:#06131d;color:#8faec7;font-size:10px}.oms-simnote b{color:#dff5ff}
    .oms-profile{margin-top:18px}.oms-profile-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:13px}.oms-profile-stat{padding:13px;border:1px solid #1e4d69;border-radius:12px;background:#081b2b}.oms-profile-stat span{font-size:9px;color:#7599b3;letter-spacing:1px;font-weight:900}.oms-profile-stat b{display:block;font-size:20px;margin-top:5px}
    .oms-comp-view{margin-top:0}.oms-comp-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap}.oms-kicker{font-size:10px;letter-spacing:1.7px;color:#79d0ff;font-weight:950}.oms-comp-title{font-size:26px;font-weight:950;margin-top:4px}.oms-select{min-width:230px;padding:10px 12px;border-radius:9px;border:1px solid #28638c;background:#071a2a;color:#fff;font-weight:800}.oms-tabs{display:flex;gap:6px;overflow:auto;margin-top:14px}.oms-tab{border:1px solid #255a7d;background:#0a2237;color:#9db9cd;border-radius:8px;padding:8px 11px;font-size:10px;font-weight:900;white-space:nowrap}.oms-tab.active{border-color:#18d79b;background:#07352f;color:#fff}.oms-comp-grid{display:grid;grid-template-columns:1.5fr .5fr;gap:13px;margin-top:13px}.oms-comp-box{border:1px solid #184b6e;border-radius:15px;background:linear-gradient(145deg,#091e30f7,#05121ef7);padding:14px;overflow:auto}.oms-table{width:100%;border-collapse:collapse;font-size:11px}.oms-table th{padding:8px 6px;color:#7599b3;font-size:9px;text-align:left;border-bottom:1px solid #1b455f}.oms-table td{padding:9px 6px;border-bottom:1px solid #12354b}.oms-table tr.user td{background:#07352f;color:#fff}.oms-table .club{font-weight:850}.oms-table .pts{font-weight:950}.oms-side{display:grid;gap:8px}.oms-side-item{padding:11px;border:1px solid #194963;border-radius:10px;background:#071a2a}.oms-side-item b{font-size:11px}.oms-side-item small{display:block;color:#8faec7;margin-top:4px;line-height:1.4}.oms-cups{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px}.oms-cup{padding:11px;border:1px solid #194963;border-radius:10px;background:#071a2a}.oms-cup b{font-size:11px}
    @media(max-width:900px){.oms-profile-grid{grid-template-columns:1fr 1fr}.oms-comp-grid{grid-template-columns:1fr}.oms-custom{margin-left:0}}@media(max-width:600px){.oms-profile-grid{grid-template-columns:1fr}.oms-simcontrols{display:grid;grid-template-columns:1fr 1fr}.oms-custom{grid-column:1/-1}.oms-cups{grid-template-columns:1fr}}
  `;document.head.appendChild(s)}

  function simBar(){
    if(document.getElementById('oms-simbar'))return;
    const home=document.getElementById('home');if(!home)return;
    const bar=document.createElement('section');bar.id='oms-simbar';bar.className='oms-simbar';
    bar.innerHTML=`<div class="oms-simhead"><div><div class="oms-kicker">CAREER SIMULATION</div><div class="oms-simtitle">SIMULATE DAYS</div><div class="oms-simsub">Choose how far to advance. The calendar moves with your career.</div></div><div class="oms-simday" id="omsCleanDay">DAY 1</div></div><div class="oms-simcontrols"><button class="oms-simbtn primary" onclick="OMS_SIM_DAYS(1)">+1 DAY</button><button class="oms-simbtn" onclick="OMS_SIM_DAYS(3)">+3 DAYS</button><button class="oms-simbtn" onclick="OMS_SIM_DAYS(7)">+7 DAYS</button><button class="oms-simbtn" onclick="OMS_SIM_DAYS(14)">+14 DAYS</button><button class="oms-simbtn" onclick="OMS_SIM_DAYS(30)">+30 DAYS</button><div class="oms-custom"><input id="omsCleanCustom" type="number" min="1" max="365" value="5"><button class="oms-simbtn" onclick="OMS_SIM_CUSTOM_CLEAN()">SIMULATE</button></div></div><div class="oms-simnote" id="omsCleanNote">Ready · next event: <b>—</b></div>`;
    const calendarPanel=[...home.querySelectorAll('.panel')].find(p=>p.querySelector('h2')?.textContent.trim().toUpperCase().includes('SEASON CALENDAR'));
    if(calendarPanel)calendarPanel.parentNode.insertBefore(bar,calendarPanel);else home.appendChild(bar);
  }

  function movePlayerValue(){
    const home=document.getElementById('home');if(!home)return;
    const status=[...home.querySelectorAll('.panel')].find(p=>p.querySelector('h2')?.textContent.trim().toUpperCase()==='PLAYER STATUS');
    if(!status||document.getElementById('omsProfileView'))return;
    const app=document.getElementById('app'),main=app?.querySelector('main');if(!main)return;
    const view=document.createElement('section');view.id='omsProfileView';view.className='view';view.innerHTML='<div class="oms-profile"></div>';main.appendChild(view);view.querySelector('.oms-profile').appendChild(status);status.classList.add('oms-profile');
    const nav=document.getElementById('nav');if(nav&&!document.getElementById('omsProfileNav')){const b=document.createElement('button');b.id='omsProfileNav';b.textContent='PLAYER';b.onclick=()=>showCleanView('omsProfileView','omsProfileNav');nav.appendChild(b)}
  }

  function cleanHome(){
    const home=document.getElementById('home');if(!home)return;
    // Remove the duplicate Player Calendar panel; the Season Calendar remains the single calendar.
    [...home.querySelectorAll('.panel')].forEach(p=>{const h=p.querySelector('h2');if(h&&h.textContent.trim().toUpperCase()==='PLAYER CALENDAR')p.remove()});
    simBar();movePlayerValue();
  }

  function renderSim(){
    const s=get(),day=Number(s.day||1);const d=document.getElementById('omsCleanDay');if(d)d.textContent='DAY '+day;
    const a=document.getElementById('omsCleanNote');if(a){let next='Daily activity';if(day%7===1||day%7===5)next='⚽ Matchday';a.innerHTML=`Ready · <b>DAY ${day}</b> · ${next} · Fitness ${Math.round(s.fitness??0)}% · Morale ${Math.round(s.morale??0)}%`}
  }
  window.OMS_SIM_CUSTOM_CLEAN=()=>{const n=Math.max(1,Math.min(365,parseInt(document.getElementById('omsCleanCustom')?.value||'1',10)));if(typeof window.OMS_SIM_DAYS==='function')window.OMS_SIM_DAYS(n);else if(typeof window.advance==='function')window.advance(n)};

  function renderCompetitions(){
    const app=document.getElementById('app');if(!app||app.classList.contains('hidden'))return;css();
    const nav=document.getElementById('nav');if(nav&&!document.getElementById('omsCompNav')){const b=document.createElement('button');b.id='omsCompNav';b.textContent='COMPETITIONS';b.onclick=()=>showCleanView('omsCompetitionView','omsCompNav');nav.appendChild(b)}
    let view=document.getElementById('omsCompetitionView');if(!view){view=document.createElement('section');view.id='omsCompetitionView';view.className='view';view.innerHTML='<div class="oms-comp-view"></div>';app.querySelector('main').appendChild(view)}
    const center=view.firstElementChild;const idx=Math.min(comps.length-1,Math.max(0,Number(view.dataset.idx||0)));const c=comps[idx];const day=Math.max(1,Number(get().day||1));
    const rows=c[2].map((team,i)=>{const played=Math.max(1,Math.floor(day/3)+(i%3));const w=Math.max(0,Math.floor(played*.5)-((i+day)%4===0?1:0));const dr=Math.max(0,Math.floor(played*.2)+((i+day)%5===0?1:0));const l=Math.max(0,played-w-dr);const gd=w*2+dr-(l*2);return{team,p:played,w,d:dr,l,gd,pts:w*3+dr,pos:i}}).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||a.team.localeCompare(b.team));
    center.innerHTML=`<section class="oms-comp-box"><div class="oms-comp-head"><div><div class="oms-kicker">COMPETITIONS</div><div class="oms-comp-title">${esc(c[0])}</div><div class="muted">${esc(c[1])} · simulated standings</div></div><select id="omsCompSelect" class="oms-select">${comps.map((x,i)=>`<option value="${i}" ${i===idx?'selected':''}>${esc(x[0])}</option>`).join('')}</select></div><div class="oms-tabs"><button class="oms-tab active">TABLE</button><button class="oms-tab">FIXTURES</button><button class="oms-tab">RESULTS</button><button class="oms-tab">TOP SCORERS</button><button class="oms-tab">NEWS</button></div><div class="oms-comp-grid"><div class="oms-comp-box"><table class="oms-table"><thead><tr><th>#</th><th>CLUB</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.team.toLowerCase()===String(club()).toLowerCase()?'user':''}"><td>${i+1}</td><td class="club">${esc(r.team)}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gd>0?'+':''}${r.gd}</td><td class="pts">${r.pts}</td></tr>`).join('')}</tbody></table></div><aside class="oms-comp-box"><div class="oms-kicker">COMPETITION STATUS</div><div class="oms-side"><div class="oms-side-item"><b>🏆 Leader</b><small>${esc(rows[0]?.team||'—')}</small></div><div class="oms-side-item"><b>⭐ Your club</b><small>${esc(club())}</small></div><div class="oms-side-item"><b>📅 Current day</b><small>Day ${day}</small></div><div class="oms-side-item"><b>📈 Table</b><small>Updates as the career advances.</small></div></div></aside></div><div class="oms-kicker" style="margin-top:16px">CUPS & CONTINENTAL</div><div class="oms-cups">${cups.map(x=>`<div class="oms-cup"><b>🏆 ${esc(x)}</b></div>`).join('')}</div></section>`;
    view.querySelector('#omsCompSelect').onchange=e=>{view.dataset.idx=e.target.value;renderCompetitions()};
  }

  function showCleanView(id,navId){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById(id)?.classList.add('active');document.querySelectorAll('#nav button').forEach(b=>b.classList.remove('active'));document.getElementById(navId)?.classList.add('active');}
  window.OMSCleanHub={render:()=>{cleanHome();renderSim();renderCompetitions()}};
  function boot(){cleanHome();renderSim();renderCompetitions()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();