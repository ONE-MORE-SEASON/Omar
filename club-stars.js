/* ONE MORE SEASON — FC-style club star ratings
   UI-only module: labels and badges; does not alter match/career simulation. */
(() => {
  'use strict';
  if (window.__OMS_CLUB_STARS_V1__) return;
  window.__OMS_CLUB_STARS_V1__ = true;

  const CLUBS = [
    'Hillcrest Academy','Youth Academy','BK Häcken','Malmö FF','Malmö','Hammarby','Djurgårdens IF','Djurgården','IF Elfsborg','Elfsborg','AIK','IFK Göteborg','IFK Norrköping','IF Brommapojkarna',
    'Arsenal','Chelsea','Liverpool','Manchester City','Manchester United','Tottenham','Newcastle United','Aston Villa','Brighton','West Ham','West Ham United','Crystal Palace','Everton','Nottingham Forest','Fulham','Brentford','Wolves','Wolverhampton','Bournemouth','Leicester City',
    'Real Madrid','Barcelona','Atlético Madrid','Athletic Club','Real Sociedad','Villarreal','Real Betis','Sevilla','Valencia','Girona','Getafe','Celta Vigo','Osasuna','Mallorca','Rayo Vallecano','Alavés','Las Palmas','Espanyol',
    'Bayern Munich','Bayer Leverkusen','Borussia Dortmund','RB Leipzig','VfB Stuttgart','Wolfsburg','Eintracht Frankfurt','SC Freiburg','Hoffenheim','Union Berlin','Mainz 05','Werder Bremen','Borussia Mönchengladbach','Augsburg','Heidenheim','St. Pauli','Holstein Kiel',
    'Inter','AC Milan','Juventus','Napoli','Roma','Lazio','Atalanta','Fiorentina','Bologna','Torino','Genoa','Monza','Udinese','Parma','Cagliari','Como','Lecce','Empoli','Verona','Venezia',
    'Paris Saint-Germain','PSG','Marseille','Lille','Monaco','Lyon','Nice','Lens','Rennes','Strasbourg','Nantes','Montpellier','Toulouse','Brest','Reims','Auxerre','Saint-Étienne','Le Havre','Angers',
    'Ajax','PSV Eindhoven','Feyenoord','AZ Alkmaar','Twente','Utrecht','Groningen','Heerenveen','NEC Nijmegen','Sparta Rotterdam','Go Ahead Eagles','Fortuna Sittard','PEC Zwolle','Heracles','NAC Breda','Willem II',
    'Benfica','Porto','Sporting CP','Braga','Vitória SC','Boavista','Famalicão','Gil Vicente','Rio Ave','Estoril','Arouca','Casa Pia','Moreirense','Nacional','Farense','Santa Clara',
    'Galatasaray','Fenerbahçe','Beşiktaş','Trabzonspor','Başakşehir','Kasımpaşa','Antalyaspor','Samsunspor','Alanyaspor','Rizespor','Konyaspor','Kayserispor','Gaziantep','Sivasspor','Göztepe','Eyüpspor',
    'Flamengo','Palmeiras','Atlético Mineiro','Botafogo','Fluminense','São Paulo','Corinthians','Grêmio','Internacional','Cruzeiro','Bahia','Fortaleza','Vasco da Gama','Athletico Paranaense','Bragantino','Santos',
    'Al-Hilal','Al Nassr','Al-Ahli','Al-Ittihad','Al-Ettifaq','Al-Shabab','Al-Qadsiah','Al-Taawoun','Al-Fateh','Al-Raed','Damac','Al-Khaleej','Al-Wehda','Al-Okhdood','Al-Fayha','Al-Riyadh',
    'Inter Miami','LAFC','Vancouver Whitecaps','LA Galaxy','Seattle Sounders','Atlanta United','New York City FC','New York Red Bulls','Columbus Crew','FC Cincinnati','Orlando City','Austin FC','FC Dallas','Dallas','Houston Dynamo','Toronto FC','CF Montréal',
    'Celtic','Rangers','Aberdeen','Hearts','Hibernian','Motherwell','Dundee United','Dundee','St Mirren','Ross County','Kilmarnock','St Johnstone',
    'Club Brugge','Anderlecht','Genk','Gent','Antwerp','Standard Liège','Union SG','Mechelen','Charleroi','Cercle Brugge','Westerlo','OH Leuven','Sint-Truiden','Kortrijk','Dender','Beerschot',
    'Dinamo Zagreb','Hajduk Split','Rijeka','Osijek','Lokomotiva Zagreb','Gorica','Varaždin','Istra 1961','Šibenik','Slaven Belupo',
    'Red Bull Salzburg','Sturm Graz','Rapid Wien','Austria Wien','LASK','Wolfsberger AC','Austria Klagenfurt','Hartberg','Altach','Blau-Weiß Linz','Grazer AK','WSG Tirol',
    'Malmö FF','Al Nassr','Al-Hilal','Al-Ahli','Al-Ittihad','Sporting CP','Feyenoord','Lille','Brighton','Bologna','Real Sociedad'
  ];

  const aliases = new Map();
  function norm(value) {
    return String(value ?? '').toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'and')
      .replace(/\b(fc|cf|ac|if|bk|sc|sv|ss|rc|as)\b/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  }
  function addClub(name) { if (name && !aliases.has(norm(name))) aliases.set(norm(name), name); }
  CLUBS.forEach(addClub);
  function addRuntimeClubs() {
    (window.OMS_CLUBS || []).forEach(addClub);
    (window.OMS_PLAYERS || []).forEach(p => {
      if (Array.isArray(p)) addClub(p[1]);
      else if (p && typeof p === 'object') addClub(p.club);
    });
  }
  addRuntimeClubs();

  function resolveClub(label) {
    let clean = String(label ?? '').trim()
      .replace(/\s*\((?:H|A|HOME|AWAY)\)\s*$/i, '')
      .replace(/^\s*(?:club|team)\s*:\s*/i, '')
      .trim();
    const key = norm(clean);
    if (aliases.has(key)) return aliases.get(key);
    // Look up the exact club names from the app's squad/competition data, but never
    // classify a random player name as a club just because the simulator has a fallback rating.
    const playerTeams = window.OMS_PLAYERS || [];
    for (const p of playerTeams) {
      const name = Array.isArray(p) ? p[1] : p?.club;
      if (name && norm(name) === key) { addClub(name); return name; }
    }
    return null;
  }

  function strengthFor(name) {
    if (typeof window.OMS_TEAM_STRENGTH === 'function') {
      const value = Number(window.OMS_TEAM_STRENGTH(name));
      if (Number.isFinite(value)) return Math.max(45, Math.min(99, value));
    }
    const fallback = {
      'Real Madrid':92,'Bayern Munich':91,'Manchester City':89,'Inter':89,'Paris Saint-Germain':89,'Barcelona':89,'Arsenal':88,'Liverpool':88,
      'Atlético Madrid':86,'Borussia Dortmund':85,'Sporting CP':85,'Benfica':84,'Juventus':84,'AC Milan':84,'Napoli':85,'Chelsea':83,
      'BK Häcken':75,'Malmö FF':78,'Hammarby':76,'AIK':74,'IFK Göteborg':72,'Hillcrest Academy':59,'Youth Academy':57
    };
    if (fallback[name]) return fallback[name];
    const key = norm(name);
    if (key.includes('academy')) return 59;
    if (key.includes('real madrid') || key.includes('bayern munich')) return 90;
    if (key.includes('city') || key.includes('arsenal') || key.includes('liverpool') || key.includes('barcelona')) return 87;
    if (key.includes('united') || key.includes('chelsea') || key.includes('dortmund') || key.includes('inter')) return 82;
    return 73;
  }
  function starCount(strength) {
    const v = Number(strength) || 60;
    return v >= 88 ? 5 : v >= 80 ? 4 : v >= 72 ? 3 : v >= 64 ? 2 : 1;
  }
  function badge(name, compact = true) {
    const strength = strengthFor(name), n = starCount(strength);
    const wrap = document.createElement('span');
    wrap.className = 'oms-club-rating-badge' + (compact ? ' is-compact' : '');
    wrap.dataset.club = name;
    wrap.title = name + ' · ' + n + '/5 stars · team strength ' + Math.round(strength);
    wrap.setAttribute('aria-label', name + ', ' + n + ' out of 5 stars');
    const stars = document.createElement('span');
    stars.className = 'oms-club-rating-stars';
    stars.textContent = '★'.repeat(n) + '☆'.repeat(5 - n);
    wrap.appendChild(stars);
    if (!compact) {
      const score = document.createElement('small');
      score.textContent = n + '/5';
      wrap.appendChild(score);
    }
    return wrap;
  }
  function rawText(el) {
    const copy = el.cloneNode(true);
    copy.querySelectorAll('.oms-club-rating-badge,.oms-team-rating').forEach(node => node.remove());
    return (copy.textContent || '').trim().replace(/\s+/g, ' ');
  }
  function attach(el, canonical, compact = true) {
    if (!el || !canonical || el.tagName === 'OPTION' || el.tagName === 'SELECT') return;
    // The competition table already has the official component from career-controls.js.
    if (el.classList?.contains('oms-club-cell') || el.classList?.contains('oms-team-rating')) return;
    if (el.closest('.oms-club-cell') || el.querySelector(':scope > .oms-team-rating')) return;
    const existing = el.querySelector(':scope > .oms-club-rating-badge');
    if (existing?.dataset.club === canonical) return;
    if (existing) existing.remove();
    el.appendChild(badge(canonical, compact));
    el.dataset.omsClubRating = canonical;
  }

  const specialSelectors = [
    '#opp', '#match', '#omsHomeName', '#omsAwayName', '.match-team',
    '#omsJourneyProfile h3', '#transfers .card b', '#transfers .card strong',
    '#transfers .row span', '#transfers .row strong', '#omsRealismTransfers .card b',
    '#omsRealismTransfers .card strong', '#omsRealismHistory .card h3',
    '#omsPlayersList b', '.oms-side-item small', '.oms-side-item b'
  ].join(',');
  function decorateSpecific() {
    document.querySelectorAll(specialSelectors).forEach(el => {
      if (el.closest('.oms-club-cell') || el.classList.contains('oms-rating-legend')) return;
      const raw = rawText(el);
      const canonical = resolveClub(raw);
      if (canonical) attach(el, canonical, true);
      else {
        const old = el.querySelector(':scope > .oms-club-rating-badge');
        if (old) old.remove();
        delete el.dataset.omsClubRating;
      }
    });
  }
  function decorateClubOptions() {
    const select = document.getElementById('club');
    if (!select) return;
    [...select.options].forEach(option => {
      if (!option.dataset.omsClubBase) {
        option.dataset.omsClubBase = option.value || option.textContent.trim();
        // Preserve the original value; adding stars to the visible text must never change
        // the saved selected club name.
        option.value = option.dataset.omsClubBase;
      }
      const name = resolveClub(option.dataset.omsClubBase) || option.dataset.omsClubBase;
      const n = starCount(strengthFor(name));
      const nextText = option.dataset.omsClubBase + '   ' + '★'.repeat(n) + '☆'.repeat(5 - n);
      if (option.textContent !== nextText) option.textContent = nextText;
    });
  }
  function decorateLeafText() {
    const selector = '#squad b,#squad strong,#squad h3,#transfers b,#transfers strong,#transfers h3,#academy b,#academy strong,#academy h3,.oms-comp-view .oms-side-item small,.oms-comp-view .oms-side-item b';
    document.querySelectorAll(selector).forEach(el => {
      if (el.closest('.oms-club-cell') || el.closest('.oms-team-rating') || el.classList.contains('oms-club-rating-badge')) return;
      if ([...el.children].some(child => !child.classList.contains('oms-club-rating-badge'))) return;
      const canonical = resolveClub(rawText(el));
      if (canonical) attach(el, canonical, true);
    });
  }

  function updateCreatorPreview() {
    const select = document.getElementById('club');
    if (!select) return;
    const field = select.closest('.field');
    if (!field) return;
    let preview = document.getElementById('omsCreatorClubRating');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'omsCreatorClubRating';
      preview.className = 'oms-club-preview';
      preview.setAttribute('aria-live', 'polite');
      select.insertAdjacentElement('afterend', preview);
    }
    const name = resolveClub(select.value) || select.value || 'Unknown club';
    const strength = strengthFor(name), n = starCount(strength);
    if (preview.dataset.club === name && preview.querySelector('.oms-club-rating-badge')) return;
    preview.dataset.club = name;
    preview.innerHTML = '<span class="oms-club-preview-label">CLUB QUALITY</span><span class="oms-club-preview-name"></span>';
    preview.querySelector('.oms-club-preview-name').textContent = name;
    preview.appendChild(badge(name, false));
    const desc = document.createElement('span');
    desc.className = 'oms-club-preview-desc';
    desc.textContent = n === 5 ? 'Elite squad' : n === 4 ? 'Top-level squad' : n === 3 ? 'Competitive squad' : n === 2 ? 'Developing squad' : 'Academy / rebuild';
    preview.appendChild(desc);
  }
  function updatePlayerClubCard() {
    const status = document.querySelector('#home .panel h2');
    const name = window.state?.club;
    if (!name) return;
    const statusPanel = [...document.querySelectorAll('.panel')].find(p => p.querySelector('h2')?.textContent.trim() === 'PLAYER STATUS');
    if (!statusPanel) return;
    let box = document.getElementById('omsMyClubRating');
    if (!box) {
      box = document.createElement('div');
      box.id = 'omsMyClubRating';
      box.className = 'oms-my-club-rating';
      const button = statusPanel.querySelector('button.danger');
      statusPanel.insertBefore(box, button || null);
    }
    const canonical = resolveClub(name) || name;
    const n = starCount(strengthFor(canonical));
    if (box.dataset.club === canonical && box.querySelector('.oms-club-rating-badge')) return;
    box.dataset.club = canonical;
    box.innerHTML = '<span class="oms-my-club-kicker">YOUR CLUB</span><span class="oms-my-club-name"></span>';
    box.querySelector('.oms-my-club-name').textContent = canonical;
    box.appendChild(badge(canonical, false));
    const level = document.createElement('span');
    level.className = 'oms-my-club-level';
    level.textContent = n + '/5 · Club strength';
    box.appendChild(level);
  }
  function addStyles() {
    if (document.getElementById('omsClubStarsStyles')) return;
    const style = document.createElement('style');
    style.id = 'omsClubStarsStyles';
    style.textContent = `
      .oms-club-rating-badge{display:inline-flex;align-items:center;gap:5px;vertical-align:middle;margin:4px 0 0;padding:5px 8px;border:1px solid rgba(255,211,106,.17);border-radius:999px;background:rgba(255,211,106,.055);line-height:1;white-space:nowrap;max-width:100%}
      .oms-club-rating-stars{color:#ffd36a;font-size:11px;letter-spacing:1px;text-shadow:0 0 8px rgba(255,211,106,.12)}
      .oms-club-rating-badge .oms-club-rating-stars{color:#ffd36a}
      .oms-club-rating-badge.is-compact{margin:5px 0 0;padding:4px 6px;background:rgba(255,211,106,.04)}
      .oms-club-rating-badge small{font-size:9px;font-weight:900;color:#b6c4d2;letter-spacing:.02em}
      .oms-club-rating-badge.is-compact small{display:none}
      .oms-club-preview{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;padding:9px 10px;border:1px solid rgba(130,181,215,.12);border-radius:10px;background:rgba(4,15,27,.45)}
      .oms-club-preview-label,.oms-my-club-kicker{font-size:8px;font-weight:950;letter-spacing:.14em;color:#8da9c0}
      .oms-club-preview-name,.oms-my-club-name{font-size:11px;font-weight:900;color:#eaf3fa}
      .oms-club-preview .oms-club-rating-badge,.oms-my-club-rating .oms-club-rating-badge{margin:0}
      .oms-club-preview-desc,.oms-my-club-level{font-size:9px;color:#9bb0c4}
      .oms-my-club-rating{display:grid;justify-items:start;gap:7px;margin-top:18px;margin-bottom:4px;padding:13px;border:1px solid rgba(130,181,215,.14);border-radius:13px;background:linear-gradient(145deg,rgba(19,43,60,.75),rgba(9,24,38,.75))}
      .oms-my-club-rating .oms-club-rating-badge{padding:6px 9px}
      .oms-my-club-rating .oms-club-rating-stars{font-size:15px}
      .oms-club-rating-badge{cursor:help}
      @media(max-width:600px){.oms-club-preview{align-items:flex-start}.oms-my-club-rating{padding:11px}}
    `;
    document.head.appendChild(style);
  }

  let queued = false;
  function refresh() {
    queued = false;
    addRuntimeClubs();
    decorateClubOptions();
    updateCreatorPreview();
    updatePlayerClubCard();
    decorateSpecific();
    decorateLeafText();
  }
  function queueRefresh() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame ? requestAnimationFrame(refresh) : setTimeout(refresh, 0);
  }
  function start() {
    addRuntimeClubs();
    addStyles();
    refresh();
    const select = document.getElementById('club');
    select?.addEventListener('change', queueRefresh);
    const app = document.getElementById('app');
    if (app && window.MutationObserver) {
      const observer = new MutationObserver(() => queueRefresh());
      observer.observe(app, {subtree:true,childList:true,characterData:true});
    }
    const creator = document.getElementById('creator');
    if (creator && window.MutationObserver) {
      const observer = new MutationObserver(() => queueRefresh());
      observer.observe(creator, {subtree:true,childList:true,characterData:true});
    }
    document.addEventListener('change', e => { if(e.target?.id==='club') queueRefresh(); });
    document.addEventListener('click', e => {
      if (e.target.closest('#nav button')) queueRefresh();
    });
    window.OMS_CLUB_STAR_COUNT = name => starCount(strengthFor(resolveClub(name) || name));
    window.OMS_REFRESH_CLUB_STARS = queueRefresh;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();