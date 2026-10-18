/* ONE MORE SEASON — Career Controls + Competition Center
   Keeps the single working calendar and adds an FC-style competition/standings hub.
   Dependency-free; safe to run after the main page renders. */
(() => {
  'use strict';
  if (window.__OMS_COMPETITIONS__) return;
  window.__OMS_COMPETITIONS__ = true;

  const esc = s => String(s ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const state = () => window.state || {};
  const playerClub = () => state().club || state().team || document.querySelector('#club')?.value || 'Hillcrest Academy';
  const playerName = () => state().name || document.querySelector('#name')?.value || 'Player';

  const competitions = [
    {name:'Premier League', country:'England', teams:['Arsenal','Chelsea','Liverpool','Manchester City','Manchester United','Tottenham','Aston Villa','Newcastle United','West Ham United','Brighton','Crystal Palace','Everton','Fulham','Wolverhampton','Brentford','Nottingham Forest','Bournemouth','Leicester City']},
    {name:'La Liga', country:'Spain', teams:['Real Madrid','Barcelona','Atlético Madrid','Athletic Club','Real Sociedad','Villarreal','Real Betis','Sevilla','Valencia','Girona','Getafe','Celta Vigo','Osasuna','Mallorca','Rayo Vallecano','Alavés','Las Palmas','Espanyol']},
    {name:'Bundesliga', country:'Germany', teams:['Bayern Munich','Borussia Dortmund','Bayer Leverkusen','RB Leipzig','VfB Stuttgart','Wolfsburg','Eintracht Frankfurt','SC Freiburg','Hoffenheim','Union Berlin','Mainz 05','Werder Bremen','Borussia Mönchengladbach','Augsburg','Heidenheim','St. Pauli','Holstein Kiel','RB Leipzig']},
    {name:'Serie A', country:'Italy', teams:['Inter','AC Milan','Juventus','Napoli','Roma','Lazio','Atalanta','Fiorentina','Bologna','Torino','Genoa','Monza','Udinese','Parma','Cagliari','Como','Lecce','Empoli','Verona','Venezia']},
    {name:'Ligue 1', country:'France', teams:['Paris Saint-Germain','Marseille','Lille','Monaco','Lyon','Nice','Lens','Rennes','Strasbourg','Nantes','Montpellier','Toulouse','Brest','Reims','Auxerre','Saint-Étienne','Le Havre','Angers']},
    {name:'Eredivisie', country:'Netherlands', teams:['Ajax','PSV Eindhoven','Feyenoord','AZ Alkmaar','Twente','Utrecht','Groningen','Heerenveen','NEC Nijmegen','Sparta Rotterdam','Go Ahead Eagles','Fortuna Sittard','PEC Zwolle','Heracles','NAC Breda','Willem II']},
    {name:'Primeira Liga', country:'Portugal', teams:['Benfica','Porto','Sporting CP','Braga','Vitória SC','Boavista','Famalicão','Gil Vicente','Rio Ave','Estoril','Arouca','Casa Pia','Moreirense','Nacional','Farense','Santa Clara']},
    {name:'Süper Lig', country:'Türkiye', teams:['Galatasaray','Fenerbahçe','Beşiktaş','Trabzonspor','Başakşehir','Kasımpaşa','Antalyaspor','Samsunspor','Alanyaspor','Rizespor','Konyaspor','Kayserispor','Gaziantep','Sivasspor','Göztepe','Eyüpspor']},
    {name:'Brasileirão', country:'Brazil', teams:['Flamengo','Palmeiras','Atlético Mineiro','Botafogo','Fluminense','São Paulo','Corinthians','Grêmio','Internacional','Cruzeiro','Bahia','Fortaleza','Vasco da Gama','Athletico Paranaense','Bragantino','Santos']},
    {name:'MLS', country:'USA', teams:['Inter Miami','LAFC','Vancouver Whitecaps','LA Galaxy','Seattle Sounders','Atlanta United','New York City FC','New York Red Bulls','Columbus Crew','FC Cincinnati','Orlando City','Austin FC','Dallas','Houston Dynamo','Toronto FC','CF Montréal']},
    {name:'Saudi Pro League', country:'Saudi Arabia', teams:['Al-Hilal','Al Nassr','Al-Ahli','Al-Ittihad','Al-Ettifaq','Al-Shabab','Al-Qadsiah','Al-Taawoun','Al-Fateh','Al-Raed','Damac','Al-Khaleej','Al-Wehda','Al-Okhdood','Al-Fayha','Al-Riyadh']},
    {name:'Scottish Premiership', country:'Scotland', teams:['Celtic','Rangers','Aberdeen','Hearts','Hibernian','Motherwell','Dundee United','Dundee','St Mirren','Ross County','Kilmarnock','St Johnstone']},
    {name:'Belgian Pro League', country:'Belgium', teams:['Club Brugge','Anderlecht','Genk','Gent','Antwerp','Standard Liège','Union SG','Mechelen','Charleroi','Cercle Brugge','Westerlo','OH Leuven','Sint-Truiden','Kortrijk','Dender','Beerschot']},
    {name:'Croatian First Football League', country:'Croatia', teams:['Dinamo Zagreb','Hajduk Split','Rijeka','Osijek','Lokomotiva Zagreb','Gorica','Varaždin','Istra 1961','Šibenik','Slaven Belupo']},
    {name:'Austrian Bundesliga', country:'Austria', teams:['Red Bull Salzburg','Sturm Graz','Rapid Wien','Austria Wien','LASK','Wolfsberger AC','Austria Klagenfurt','Hartberg','Altach','Blau-Weiß Linz','Grazer AK','WSG Tirol']}
  ];

  const cups = [
    ['UEFA Champions League','Europe'],['UEFA Europa League','Europe'],['UEFA Conference League','Europe'],
    ['FA Cup','England'],['Copa del Rey','Spain'],['DFB-Pokal','Germany'],['Coppa Italia','Italy'],
    ['Coupe de France','France'],['KNVB Cup','Netherlands'],['Taça de Portugal','Portugal'],['Türkiye Cup','Türkiye'],
    ['Copa do Brasil','Brazil'],['U.S. Open Cup','USA'],['King Cup','Saudi Arabia']
  ];

  function styles(){
    if(document.getElementById('omsCompStyles')) return;
    const s=document.createElement('style'); s.id='omsCompStyles'; s.textContent=`
      #omsCompetitionCenter{margin-top:18px}
      .omsCompHead{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap}
      .omsCompKicker{font-size:10px;letter-spacing:1.8px;font-weight:950;color:#79d0ff}
      .omsCompTitle{font-size:25px;font-weight:950;margin-top:5px}
      .omsCompSelect{min-width:240px;padding:11px 13px;border-radius:10px;border:1px solid #28638c;background:#071a2a;color:#fff;font-weight:800}
      .omsCompTabs{display:flex;gap:7px;overflow:auto;margin-top:16px;padding-bottom:2px}
      .omsCompTab{border:1px solid #255a7d;background:#0a2237;color:#9db9cd;border-radius:9px;padding:9px 12px;font-size:10px;font-weight:900;white-space:nowrap}
      .omsCompTab.active{color:#fff;border-color:#18d79b;background:#07352f;box-shadow:0 0 18px #18d79b18}
      .omsCompGrid{display:grid;grid-template-columns:1.45fr .55fr;gap:14px;margin-top:14px}
      .omsCompPanel{border:1px solid #184b6e;border-radius:16px;background:linear-gradient(145deg,#091e30f7,#05121ef7);padding:16px;overflow:hidden}
      .omsTable{width:100%;border-collapse:collapse;font-size:11px}
      .omsTable th{text-align:left;color:#7599b3;font-size:9px;letter-spacing:1px;padding:9px 7px;border-bottom:1px solid #1b455f}
      .omsTable td{padding:10px 7px;border-bottom:1px solid #12354b;color:#d8e7f2}
      .omsTable tr:last-child td{border-bottom:0}.omsTable .pos{width:30px;color:#6f9ab6}.omsTable .pts{font-weight:950;color:#fff}
      .omsTable tr.omsUser td{background:#07352f;color:#fff}.omsClub{font-weight:850}.omsForm{font-size:9px;letter-spacing:2px;color:#79d0ff}
      .omsSideList{display:grid;gap:8px;margin-top:12px}.omsSideItem{padding:11px;border:1px solid #194963;border-radius:10px;background:#071a2a}.omsSideItem b{font-size:11px}.omsSideItem small{display:block;color:#8faec7;margin-top:4px;line-height:1.35}
      .omsCupGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}.omsCup{padding:12px;border:1px solid #194963;border-radius:11px;background:#071a2a}.omsCup b{display:block;font-size:11px}.omsCup span{color:#8faec7;font-size:10px}
      @media(max-width:850px){.omsCompGrid{grid-template-columns:1fr}.omsCompSelect{min-width:200px}.omsCupGrid{grid-template-columns:1fr}}
    `; document.head.appendChild(s);
  }

  function makeRows(comp){
    const day=Math.max(1,Number(state().day||document.querySelector('#day')?.textContent||1));
    const seed=comp.name.length*17+day*7;
    return comp.teams.map((team,i)=>{
      const form=((seed+i*13)%7);
      const played=Math.max(1,Math.floor(day/3)+((i+seed)%3));
      const wins=Math.max(0,Math.floor(played*.48)+((i+seed)%2));
      const draws=Math.max(0,Math.floor(played*.22)+((i+2)%2));
      const losses=Math.max(0,played-wins-draws);
      const gf=Math.max(1,wins*2+draws+((i+seed)%5));
      const ga=Math.max(0,losses*2+((i+3)%4));
      return {team,played,wins,draws,losses,gf,ga,gd:gf-ga,pts:wins*3+draws,form:['W','W','D','W','L','W','D'][form],i};
    }).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf).map((r,i)=>({...r,pos:i+1}));
  }

  function render(){
    const app=document.querySelector('#app'); if(!app || app.classList.contains('hidden')) return;
    styles();
    const home=document.querySelector('#home'); if(!home) return;
    let nav=document.querySelector('#nav');
    if(nav && !document.getElementById('omsCompetitionNav')){
      const b=document.createElement('button'); b.id='omsCompetitionNav'; b.textContent='COMPETITIONS';
      b.onclick=()=>showCompetition(); nav.appendChild(b);
    }
    let view=document.getElementById('omsCompetitionView');
    if(!view){
      view=document.createElement('section'); view.id='omsCompetitionView'; view.className='view';
      view.innerHTML=`<div id="omsCompetitionCenter"></div>`;
      app.querySelector('main').appendChild(view);
    }
    const center=view.querySelector('#omsCompetitionCenter');
    const selected=view.dataset.competition||competitions[0].name;
    const comp=competitions.find(x=>x.name===selected)||competitions[0];
    const rows=makeRows(comp);
    const user=playerClub();
    center.innerHTML=`<section class="omsCompPanel">
      <div class="omsCompHead"><div><div class="omsCompKicker">COMPETITION HUB · SEASON 1</div><div class="omsCompTitle">${esc(comp.name)}</div><div class="muted">${esc(comp.country)} · live simulated standings</div></div>
      <select class="omsCompSelect" id="omsCompetitionSelect">${competitions.map(c=>`<option ${c.name===comp.name?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="omsCompTabs"><button class="omsCompTab active">TABLE</button><button class="omsCompTab">FIXTURES</button><button class="omsCompTab">RESULTS</button><button class="omsCompTab">TOP SCORERS</button><button class="omsCompTab">NEWS</button></div>
      <div class="omsCompGrid"><div class="omsCompPanel" style="padding:8px"><table class="omsTable"><thead><tr><th>#</th><th>CLUB</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th><th>FORM</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.team.toLowerCase()===String(user).toLowerCase()?'omsUser':''}"><td class="pos">${r.pos}</td><td class="omsClub">${esc(r.team)}</td><td>${r.played}</td><td>${r.wins}</td><td>${r.draws}</td><td>${r.losses}</td><td>${r.gd>0?'+':''}${r.gd}</td><td class="pts">${r.pts}</td><td class="omsForm">${r.form}</td></tr>`).join('')}</tbody></table></div>
      <aside class="omsCompPanel"><div class="omsCompKicker">COMPETITION STATUS</div><div class="omsSideList"><div class="omsSideItem"><b>🏆 Title race</b><small>${esc(rows[0].team)} lead the simulated table.</small></div><div class="omsSideItem"><b>⭐ Your club</b><small>${esc(user)} · highlighted when present in this competition.</small></div><div class="omsSideItem"><b>📅 Matchweek</b><small>Day ${Math.max(1,Number(state().day||1))} · standings update as you simulate.</small></div><div class="omsSideItem"><b>🔥 Form</b><small>Last-five form is shown in the table.</small></div></div></aside></div>
      <div class="omsCompKicker" style="margin-top:18px">CUPS & CONTINENTAL COMPETITIONS</div><div class="omsCupGrid">${cups.map(c=>`<div class="omsCup"><b>${esc(c[0])}</b><span>${esc(c[1])} · ${c[0].includes('Champions')?'League phase + knockout': 'Knockout competition'}</span></div>`).join('')}</div>
    </section>`;
    view.querySelector('#omsCompetitionSelect').onchange=e=>{view.dataset.competition=e.target.value;render()};
  }

  function showCompetition(){
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('omsCompetitionView')?.classList.add('active');
    document.querySelectorAll('#nav button').forEach(b=>b.classList.remove('active'));
    document.getElementById('omsCompetitionNav')?.classList.add('active');
    render();
  }
  window.OMSCompetitions={render,showCompetition,competitions};

  function boot(){
    // Remove the redundant old calendar panel only; the existing Season Calendar remains.
    document.querySelectorAll('#home .panel').forEach(panel=>{
      const h=panel.querySelector('h2');
      if(h && h.textContent.trim().toUpperCase()==='PLAYER CALENDAR') panel.remove();
    });
    render();
    setTimeout(render,150); setTimeout(render,600);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
