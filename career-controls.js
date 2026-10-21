/* ONE MORE SEASON — Clean Career Hub + Competition Center v2 */
(() => {
  'use strict';
  if(window.__OMS_CLEAN_HUB__)return;
  window.__OMS_CLEAN_HUB__=true;

  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const get=()=>((typeof window.OMS_GET_STATE==='function'?window.OMS_GET_STATE():window.state)||{});
  const club=()=>get().club||get().team||document.querySelector('#club')?.value||'Hillcrest Academy';
  const comps=[
    ['Premier League','England',['Arsenal','Chelsea','Liverpool','Manchester City','Manchester United','Tottenham','Aston Villa','Newcastle United','West Ham United','Brighton','Crystal Palace','Everton','Fulham','Wolverhampton','Brentford','Nottingham Forest','Bournemouth','Leicester City']],
    ['La Liga','Spain',['Real Madrid','Barcelona','Atlético Madrid','Athletic Club','Real Sociedad','Villarreal','Real Betis','Sevilla','Valencia','Girona','Getafe','Celta Vigo','Osasuna','Mallorca','Rayo Vallecano','Alavés','Las Palmas','Espanyol']],
    ['Bundesliga','Germany',['Bayern Munich','Borussia Dortmund','Bayer Leverkusen','RB Leipzig','VfB Stuttgart','Wolfsburg','Eintracht Frankfurt','SC Freiburg','Hoffenheim','Union Berlin','Mainz 05','Werder Bremen','Borussia Mönchengladbach','Augsburg','Heidenheim','St. Pauli','Hamburger SV','1. FC Köln']],
    ['Serie A','Italy',['Inter','AC Milan','Juventus','Napoli','Roma','Lazio','Atalanta','Fiorentina','Bologna','Torino','Genoa','Monza','Udinese','Parma','Cagliari','Como','Lecce','Empoli','Verona','Venezia']],
    ['Ligue 1','France',['Paris Saint-Germain','Marseille','Lille','Monaco','Lyon','Nice','Lens','Rennes','Strasbourg','Nantes','Montpellier','Toulouse','Brest','Reims','Auxerre','Saint-Étienne','Le Havre','Angers']],
    ['Eredivisie','Netherlands',['Ajax','PSV Eindhoven','Feyenoord','AZ Alkmaar','Twente','Utrecht','Groningen','Heerenveen','NEC Nijmegen','Sparta Rotterdam','Go Ahead Eagles','Fortuna Sittard','PEC Zwolle','Heracles','NAC Breda','Willem II']],
    ['Primeira Liga','Portugal',['Benfica','Porto','Sporting CP','Braga','Vitória SC','Boavista','Famalicão','Gil Vicente','Rio Ave','Estoril','Arouca','Casa Pia','Moreirense','Nacional','Farense','Santa Clara']],
    ['Süper Lig','Türkiye',['Galatasaray','Fenerbahçe','Beşiktaş','Trabzonspor','Başakşehir','Kasımpaşa','Antalyaspor','Samsunspor','Alanyaspor','Rizespor','Konyaspor','Kayserispor','Gaziantep','Sivasspor','Göztepe','Eyüpspor']],
    ['Brasileirão','Brazil',['Flamengo','Palmeiras','Atlético Mineiro','Botafogo','Fluminense','São Paulo','Corinthians','Grêmio','Internacional','Cruzeiro','Bahia','Fortaleza','Vasco da Gama','Athletico Paranaense','Bragantino','Santos']],
    ['MLS','USA',['Inter Miami','LAFC','Vancouver Whitecaps','LA Galaxy','Seattle Sounders','Atlanta United','New York City FC','New York Red Bulls','Columbus Crew','FC Cincinnati','Orlando City','Austin FC','Dallas','Houston Dynamo','Toronto FC','CF Montréal']],
    ['Saudi Pro League','Saudi Arabia',['Al-Hilal','Al Nassr','Al-Ahli','Al-Ittihad','Al-Ettifaq','Al-Shabab','Al-Qadsiah','Al-Taawoun','Al-Fateh','Al-Raed','Damac','Al-Khaleej','Al-Wehda','Al-Okhdood','Al-Fayha','Al-Riyadh']],
    ['Allsvenskan','Sweden',['Malmö FF','Hammarby','Djurgårdens IF','BK Häcken','AIK','IF Elfsborg','IFK Göteborg','Mjällby AIF','GAIS','IFK Norrköping','IF Brommapojkarna','Sirius','Halmstads BK','Kalmar FF','IFK Värnamo','Östers IF']],
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
    .oms-comp-view{margin-top:0}.oms-comp-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap}.oms-kicker{font-size:10px;letter-spacing:1.7px;color:#79d0ff;font-weight:950}.oms-comp-title{font-size:26px;font-weight:950;margin-top:4px}.oms-select{min-width:230px;padding:10px 12px;border-radius:9px;border:1px solid #28638c;background:#071a2a;color:#fff;font-weight:800}.oms-tabs{display:flex;gap:6px;overflow:auto;margin-top:14px}.oms-tab{border:1px solid #255a7d;background:#0a2237;color:#9db9cd;border-radius:8px;padding:8px 11px;font-size:10px;font-weight:900;white-space:nowrap}.oms-tab.active{border-color:#18d79b;background:#07352f;color:#fff}.oms-comp-grid{display:grid;grid-template-columns:1.5fr .5fr;gap:13px;margin-top:13px}.oms-comp-box{border:1px solid #184b6e;border-radius:15px;background:linear-gradient(145deg,#091e30f7,#05121ef7);padding:14px;overflow:auto}.oms-table{width:100%;border-collapse:collapse;font-size:11px}.oms-table th{padding:8px 6px;color:#7599b3;font-size:9px;text-align:left;border-bottom:1px solid #1b455f}.oms-table td{padding:9px 6px;border-bottom:1px solid #12354b}.oms-table tr.user td{background:#07352f;color:#fff}.oms-table .club{font-weight:850}.oms-table .pts{font-weight:950}
    .oms-team-rating{display:flex;align-items:center;gap:7px;margin-top:4px;line-height:1}
    .oms-team-stars{font-size:12px;letter-spacing:1px;color:#ffd36a;text-shadow:0 0 8px rgba(255,211,106,.13);white-space:nowrap}
    .oms-team-stars .empty{color:#405369;text-shadow:none}
    .oms-team-rating small{font-size:9px;font-weight:850;color:#93a9be;letter-spacing:.04em;white-space:nowrap}
    .oms-team-rating.compact{display:inline-flex;margin:0 0 0 7px;vertical-align:middle}
    .oms-team-rating.compact .oms-team-stars{font-size:10px;letter-spacing:0}
    .oms-club-cell{min-width:128px}
    .oms-rating-legend{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:10px;color:#91a8bd;margin:10px 0 2px}.oms-side{display:grid;gap:8px}.oms-side-item{padding:11px;border:1px solid #194963;border-radius:10px;background:#071a2a}.oms-side-item b{font-size:11px}.oms-side-item small{display:block;color:#8faec7;margin-top:4px;line-height:1.4}.oms-cups{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px}.oms-cup{padding:11px;border:1px solid #194963;border-radius:10px;background:#071a2a}.oms-cup b{font-size:11px}
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

  // Strength ratings are a starting point, not a fixed final ranking. All played scores use
  // seeded match simulations, so results stay consistent when a user reopens the competition tab.
  const clubPower={
    'Manchester City':89,'Arsenal':88,'Liverpool':88,'Chelsea':83,'Newcastle United':82,'Aston Villa':82,'Tottenham':81,'Manchester United':81,'Brighton':78,'Bournemouth':77,'West Ham United':76,'West Ham':76,'Crystal Palace':75,'Brentford':75,'Nottingham Forest':74,'Fulham':74,'Everton':72,'Wolverhampton':72,'Wolves':72,'Leicester City':68,
    'Real Madrid':92,'Barcelona':89,'Atlético Madrid':86,'Athletic Club':80,'Villarreal':81,'Real Sociedad':79,'Real Betis':78,'Girona':78,'Sevilla':77,'Valencia':76,'Celta Vigo':75,'Osasuna':74,'Getafe':73,'Espanyol':73,'Mallorca':73,'Rayo Vallecano':73,'Alavés':72,'Las Palmas':72,
    'Bayern Munich':91,'Bayer Leverkusen':87,'Borussia Dortmund':85,'RB Leipzig':84,'VfB Stuttgart':81,'Eintracht Frankfurt':80,'SC Freiburg':78,'Wolfsburg':77,'Hoffenheim':75,'Union Berlin':74,'Mainz 05':74,'Werder Bremen':75,'Hamburger SV':74,'1. FC Köln':73,
    'Inter':89,'Napoli':85,'AC Milan':84,'Juventus':84,'Atalanta':84,'Roma':81,'Lazio':80,'Bologna':80,'Fiorentina':79,'Torino':75,'Genoa':74,'Como':75,'Parma':72,
    'Paris Saint-Germain':89,'Monaco':82,'Marseille':81,'Lille':80,'Lyon':79,'Nice':78,'Lens':77,'Rennes':77,'Strasbourg':74,
    'PSV Eindhoven':85,'Feyenoord':82,'Ajax':80,'AZ Alkmaar':78,'Twente':76,'Utrecht':74,
    'Sporting CP':85,'Benfica':84,'Porto':83,'Braga':78,'Vitória SC':75,
    'Galatasaray':84,'Fenerbahçe':84,'Beşiktaş':78,'Trabzonspor':77,'Başakşehir':75,
    'Flamengo':85,'Palmeiras':85,'Botafogo':82,'Atlético Mineiro':80,'São Paulo':79,'Fluminense':78,'Corinthians':76,'Grêmio':76,'Internacional':77,'Santos':73,
    'Al-Hilal':85,'Al Nassr':83,'Al-Ahli':82,'Al-Ittihad':82,'Al-Qadsiah':76,
    'Inter Miami':80,'LAFC':79,'Columbus Crew':78,'Vancouver Whitecaps':77,'LA Galaxy':76,'Seattle Sounders':76,
    'Celtic':83,'Rangers':81,'Club Brugge':81,'Anderlecht':77,'Genk':77,'Dinamo Zagreb':81,'Hajduk Split':77,'Red Bull Salzburg':82,'Sturm Graz':77,'Rapid Wien':74,
    'Malmö FF':78,'Malmö':78,'Hammarby':76,'Djurgårdens IF':76,'Djurgården':76,'BK Häcken':75,'IF Elfsborg':74,'Elfsborg':74,'AIK':74,'IFK Göteborg':72,'IFK Norrköping':71,'IF Brommapojkarna':70,'GAIS':71,'IFK Värnamo':69,'Kalmar FF':69,'Halmstads BK':69,'Sirius':70,'Mjällby AIF':72,'Östers IF':67
  };
  const leagueBase={'Premier League':75,'La Liga':74,'Bundesliga':74,'Serie A':74,'Ligue 1':73,'Eredivisie':72,'Primeira Liga':72,'Süper Lig':71,'Brasileirão':73,'MLS':70,'Saudi Pro League':72,'Scottish Premiership':70,'Belgian Pro League':70,'Croatian First Football League':69,'Austrian Bundesliga':70,'Allsvenskan':69};
  const normName = value => String(value||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'').replace(/^(fc|ac|if|bk)/,'');
  function starsFromStrength(value){
    const rating=Number(value)||60;
    return rating>=88?5:rating>=81?4:rating>=73?3:rating>=66?2:1;
  }
  function starMarkup(value,compact=false){
    const count=starsFromStrength(value);
    return '<span class="oms-team-rating'+(compact?' compact':'')+'" title="Club rating: '+count+' out of 5 stars">'+
      '<span class="oms-team-stars" aria-label="'+count+' out of 5 stars">'+
      '★'.repeat(count)+'<span class="empty">'+'★'.repeat(5-count)+'</span></span>'+
      (compact?'':'<small>'+count+'/5</small>')+'</span>';
  }
  window.OMS_TEAM_STRENGTH=function(team,leagueName){
    const target=String(team||'');
    const selected=comps.find(item=>item[0]===leagueName)||comps.find(item=>item[2].some(name=>normName(name)===normName(target)));
    if(selected){
      const idx=selected[2].findIndex(name=>normName(name)===normName(target));
      if(idx>=0)return teamPower(selected[2][idx],selected[0],idx);
    }
    return teamPower(target,leagueName||'Premier League',0);
  };
  window.OMS_TEAM_STARS=function(team,leagueName,compact=false){
    return starMarkup(window.OMS_TEAM_STRENGTH(team,leagueName),compact);
  };
  function teamPower(team,league,idx=0){
    if(Number.isFinite(clubPower[team]))return clubPower[team];
    const key=Object.keys(clubPower).find(k=>normName(k)===normName(team));
    if(key)return clubPower[key];
    return Math.max(59,Math.min(79,(leagueBase[league]||71)-Math.max(0,idx-4)*0.42+((idx*7)%3-1)*0.7));
  }
  function hashSeed(text){
    let h=2166136261;
    for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}
    return h>>>0;
  }
  function seededRandom(seed){
    let value=seed>>>0;
    return ()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296};
  }
  function poissonGoals(lambda,rng){
    const limit=Math.exp(-Math.max(.12,Math.min(3.25,lambda)));
    let product=1,count=0;
    do{count++;product*=rng()}while(product>limit&&count<8);
    return Math.min(7,Math.max(0,count-1));
  }
  function scheduleRounds(teams){
    const rotation=teams.slice();
    if(rotation.length%2)rotation.push(null);
    const n=rotation.length,firstLeg=[];
    for(let round=0;round<n-1;round++){
      const games=[];
      for(let i=0;i<n/2;i++){
        let a=rotation[i],b=rotation[n-1-i];
        if(!a||!b)continue;
        if((round+i)%2===0)games.push({home:a,away:b,round:round+1});
        else games.push({home:b,away:a,round:round+1});
      }
      firstLeg.push(games);
      const tail=rotation.pop();rotation.splice(1,0,tail);
    }
    const secondLeg=firstLeg.map((games,index)=>games.map(g=>({home:g.away,away:g.home,round:firstLeg.length+index+1})));
    return firstLeg.concat(secondLeg);
  }
  function simulateLeague(comp,day,season){
    const teams=comp[2],maxRounds=Math.max(1,(teams.length%2?teams.length:teams.length-1)*2);
    const roundIndex=Math.min(maxRounds,Math.max(0,Math.floor((Math.max(1,day)+5)/7)));
    const fixtures=scheduleRounds(teams),stats=new Map();
    teams.forEach((team,i)=>stats.set(team,{team,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0,strength:teamPower(team,comp[0],i)}));
    const playedFixtures=[];
    fixtures.forEach(roundGames=>{
      roundGames.forEach(game=>{
        const home=stats.get(game.home),away=stats.get(game.away);
        const seed=hashSeed([comp[0],season,game.round,game.home,game.away].join('|'));
        const rng=seededRandom(seed);
        const homeLambda=Math.max(.25,Math.min(3.3,1.42*Math.exp((home.strength+2-away.strength)/17)));
        const awayLambda=Math.max(.18,Math.min(2.8,1.18*Math.exp((away.strength-home.strength-2)/18)));
        const homeGoals=poissonGoals(homeLambda,rng),awayGoals=poissonGoals(awayLambda,rng);
        // If the user played this exact scheduled fixture, use that actual career score.
        let recorded=null;
        const active=get(),activeClub=String(active.club||active.team||'');
        if(game.round<=roundIndex && activeClub && (normName(game.home)===normName(activeClub)||normName(game.away)===normName(activeClub))){
          const userHome=normName(game.home)===normName(activeClub),opponent=userHome?game.away:game.home;
          const saved=Array.isArray(active.matchHistory)?active.matchHistory:[];
          recorded=saved.find(m=>Number(m.season||1)===Number(season||1)&&Math.floor((Number(m.day||1)+6)/7)===game.round&&normName(m.club||'')===normName(activeClub)&&normName(m.opponent||'')===normName(opponent)&&Number.isFinite(Number(m.goalsFor))&&Number.isFinite(Number(m.goalsAgainst)));
          if(recorded){if(userHome){homeGoals=Number(recorded.goalsFor);awayGoals=Number(recorded.goalsAgainst)}else{homeGoals=Number(recorded.goalsAgainst);awayGoals=Number(recorded.goalsFor)}}
        }
        const result={...game,homeGoals,awayGoals,careerResult:Boolean(recorded)};
        if(game.round<=roundIndex){
          home.p++;away.p++;home.gf+=homeGoals;home.ga+=awayGoals;away.gf+=awayGoals;away.ga+=homeGoals;
          if(homeGoals>awayGoals){home.w++;home.pts+=3;away.l++}
          else if(homeGoals<awayGoals){away.w++;away.pts+=3;home.l++}
          else{home.d++;away.d++;home.pts++;away.pts++}
          playedFixtures.push(result);
        }
      });
    });
    const rows=[...stats.values()].map(x=>({...x,gd:x.gf-x.ga}));
    rows.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||b.strength-a.strength||a.team.localeCompare(b.team));
    const upcomingFixtures=fixtures.filter(roundGames=>roundGames.length&&roundGames[0].round>roundIndex).flat().map(g=>({...g}));
    return {rows,playedFixtures:playedFixtures.sort((a,b)=>b.round-a.round),upcomingFixtures,roundIndex,maxRounds,season:Math.max(1,Number(season)||1),teams:teams.slice(),competition:comp[0],country:comp[1]};
  }
  window.OMS_GET_COMPETITION_DATA=function(leagueName){
    const selected=comps.find(item=>item[0]===leagueName);
    const s=get(),currentClub=club(),currentLeague=comps.find(item=>item[2].some(team=>normName(team)===normName(currentClub)));
    const comp=selected||currentLeague||comps[0];
    return simulateLeague(comp,Math.max(1,Number(s.day)||1),Math.max(1,Number(s.season)||1));
  };

  function renderCompetitions(){
    const app=document.getElementById('app');if(!app||app.classList.contains('hidden'))return;css();
    const nav=document.getElementById('nav');if(nav&&!document.getElementById('omsCompNav')){const b=document.createElement('button');b.id='omsCompNav';b.textContent='COMPETITIONS';b.onclick=()=>{view.dataset.mode='TABLE';renderCompetitions();showCleanView('omsCompetitionView','omsCompNav');};nav.appendChild(b)}
    let view=document.getElementById('omsCompetitionView');if(!view){view=document.createElement('section');view.id='omsCompetitionView';view.className='view';view.innerHTML='<div class="oms-comp-view"></div>';app.querySelector('main').appendChild(view)}
    const center=view.firstElementChild;
    const hasChoice=Object.prototype.hasOwnProperty.call(view.dataset,'idx');
    const currentClub=club();
    const detectedLeague=comps.findIndex(item=>item[2].some(team=>normName(team)===normName(currentClub)));
    const idx=Math.min(comps.length-1,Math.max(0,hasChoice?Number(view.dataset.idx):(detectedLeague>=0?detectedLeague:0)));
    if(!hasChoice)view.dataset.idx=String(idx);
    const c=comps[idx],s=get(),day=Math.max(1,Number(s.day||1)),season=Math.max(1,Number(s.season||1));
    const leagueData=simulateLeague(c,day,season),rows=leagueData.rows;
    const tableStatus=leagueData.roundIndex===0?'Pre-season power ranking · no matches played':('Matchday '+leagueData.roundIndex+' / '+leagueData.maxRounds+' · simulated results');
    center.innerHTML=`<section class="oms-comp-box"><div class="oms-comp-head"><div><div class="oms-kicker">COMPETITIONS</div><div class="oms-comp-title">${esc(c[0])}</div><div class="muted">${esc(c[1])} · ${esc(tableStatus)}</div></div><select id="omsCompSelect" class="oms-select">${comps.map((x,i)=>`<option value="${i}" ${i===idx?'selected':''}>${esc(x[0])}</option>`).join('')}</select></div><div class="oms-rating-legend">TEAM QUALITY <span class="oms-team-stars">★★★★★</span><span>5 = elite · 1 = developing</span></div><div class="oms-tabs"><button class="oms-tab active">TABLE</button><button class="oms-tab">FIXTURES</button><button class="oms-tab">RESULTS</button><button class="oms-tab">TOP SCORERS</button><button class="oms-tab">NEWS</button></div><div class="oms-comp-grid"><div class="oms-comp-box"><table class="oms-table"><thead><tr><th>#</th><th>CLUB</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.team.toLowerCase()===String(club()).toLowerCase()?'user':''}"><td>${i+1}</td><td class="club oms-club-cell"><div>${esc(r.team)}</div>${starMarkup(r.strength)}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gd>0?'+':''}${r.gd}</td><td class="pts">${r.pts}</td></tr>`).join('')}</tbody></table></div><aside class="oms-comp-box"><div class="oms-kicker">COMPETITION STATUS</div><div class="oms-side"><div class="oms-side-item"><b>🏆 Leader</b><small>${esc(rows[0]?.team||'—')}</small></div><div class="oms-side-item"><b>⭐ Your club</b><small>${esc(club())}</small></div><div class="oms-side-item"><b>📅 Current day</b><small>Day ${day}</small></div><div class="oms-side-item"><b>📈 Table</b><small>Matchday ${leagueData.roundIndex} of ${leagueData.maxRounds}. Club strength matters, but upsets are possible.</small></div></div></aside></div><div class="oms-kicker" style="margin-top:16px">CUPS & CONTINENTAL</div><div class="oms-cups">${cups.map(x=>`<div class="oms-cup"><b>🏆 ${esc(x)}</b></div>`).join('')}</div></section>`;
    view.querySelector('#omsCompSelect').onchange=e=>{view.dataset.idx=e.target.value;renderCompetitions()};
  }

  function showCleanView(id,navId){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById(id)?.classList.add('active');document.querySelectorAll('#nav button').forEach(b=>b.classList.remove('active'));document.getElementById(navId)?.classList.add('active');}
  window.OMSCleanHub={render:()=>{cleanHome();renderSim();renderCompetitions()}};
  function boot(){cleanHome();renderSim();renderCompetitions()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();