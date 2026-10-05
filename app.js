const demoState = {
  profile: { name: "David Morales", level: 18, xp: 3240, bio: "Jugador, coleccionista y competidor casual." },
  games: [
    { id: 1, title: "Neon Rift", genre: "RPG", platform: "PC", description: "Explora una ciudad cyberpunk y completa misiones cooperativas.", accent: ["#7c5cff","#2fd7ff"] },
    { id: 2, title: "Starforge Arena", genre: "Acción", platform: "PC", description: "Combates rápidos, arenas competitivas y progresión por temporada.", accent: ["#ff5d7c","#ffb44a"] },
    { id: 3, title: "Kingdoms Reborn", genre: "Estrategia", platform: "PC", description: "Construye tu reino, administra recursos y domina el mapa.", accent: ["#31d49d","#2fd7ff"] },
    { id: 4, title: "Shadow Protocol", genre: "Aventura", platform: "PC", description: "Sigilo, decisiones narrativas y misiones de infiltración.", accent: ["#596579","#7c5cff"] },
    { id: 5, title: "Velocity X", genre: "Carreras", platform: "PC", description: "Carreras futuristas con mejoras y desafíos semanales.", accent: ["#2fd7ff","#7c5cff"] },
    { id: 6, title: "Pixel Legends", genre: "Indie", platform: "PC", description: "Aventura retro con exploración, jefes y coleccionables.", accent: ["#ffb44a","#ff5d7c"] }
  ],
  library: [
    { gameId: 1, progress: 72, hours: 48, status: "Jugando" },
    { gameId: 3, progress: 41, hours: 23, status: "Jugando" },
    { gameId: 6, progress: 100, hours: 31, status: "Completado" }
  ],
  wishlist: [2,5],
  achievements: [
    { id: 1, title: "Primer paso", game: "Neon Rift", xp: 100, unlocked: true },
    { id: 2, title: "Explorador urbano", game: "Neon Rift", xp: 250, unlocked: false },
    { id: 3, title: "Constructor maestro", game: "Kingdoms Reborn", xp: 300, unlocked: true },
    { id: 4, title: "Velocidad máxima", game: "Velocity X", xp: 200, unlocked: false }
  ],
  tournaments: [
    { id: 1, title: "Starforge Weekend Cup", game: "Starforge Arena", slots: 32, joined: 26, prize: "$2,500 MXN", registered: false },
    { id: 2, title: "Velocity X Sprint", game: "Velocity X", slots: 24, joined: 18, prize: "1,800 XP", registered: true },
    { id: 3, title: "Neon Rift Challenge", game: "Neon Rift", slots: 16, joined: 9, prize: "Skin exclusiva", registered: false }
  ],
  reviews: [
    { id: 1, gameId: 1, author: "Alex", rating: 5, text: "Gran ambientación y excelente progresión." },
    { id: 2, gameId: 3, author: "Mara", rating: 4, text: "Muy entretenido, especialmente en partidas largas." }
  ],
  notifications: [
    { id: 1, text: "Nuevo torneo disponible: Starforge Weekend Cup.", unread: true },
    { id: 2, text: "Desbloqueaste el logro Constructor maestro.", unread: true },
    { id: 3, text: "Neon Rift recibió una nueva actualización.", unread: false }
  ]
};

const key = "gamevault-services-state-v1";
let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : structuredClone(demoState);
  } catch {
    return structuredClone(demoState);
  }
}
function saveState() { localStorage.setItem(key, JSON.stringify(state)); }
function gameById(id) { return state.games.find(g => g.id === id); }
function escapeHtml(s="") {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function stars(n) { return "★".repeat(n) + "☆".repeat(5-n); }

const titles = {
  dashboard:["Dashboard","Resumen de tu actividad gamer."],
  catalog:["Catálogo","Explora videojuegos y agrega títulos a tu colección."],
  library:["Biblioteca","Administra progreso, horas jugadas y estado."],
  wishlist:["Lista de deseos","Guarda títulos para revisarlos después."],
  achievements:["Logros","Consulta recompensas y desbloquea objetivos."],
  tournaments:["Torneos","Revisa cupos e inscríbete a competencias."],
  reviews:["Reseñas","Consulta y publica opiniones de videojuegos."],
  notifications:["Notificaciones","Eventos generados por los diferentes servicios."],
  analytics:["Analítica","Métricas agregadas de biblioteca y progreso."],
  profile:["Perfil","Información y nivel del jugador."]
};

document.querySelectorAll(".nav-item").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".nav-item").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    render(btn.dataset.view);
  });
});
document.getElementById("resetDemo").addEventListener("click",()=>{
  state = structuredClone(demoState); saveState(); render(currentView);
});

let currentView = "dashboard";
function render(view="dashboard") {
  currentView = view;
  const [title, subtitle] = titles[view];
  document.getElementById("pageTitle").textContent = title;
  document.getElementById("pageSubtitle").textContent = subtitle;
  const map = {
    dashboard: renderDashboard, catalog: renderCatalog, library: renderLibrary,
    wishlist: renderWishlist, achievements: renderAchievements, tournaments: renderTournaments,
    reviews: renderReviews, notifications: renderNotifications, analytics: renderAnalytics, profile: renderProfile
  };
  map[view]();
}

function renderDashboard(){
  const completed = state.library.filter(x=>x.progress===100).length;
  const avg = state.library.length ? Math.round(state.library.reduce((a,b)=>a+b.progress,0)/state.library.length) : 0;
  document.getElementById("view").innerHTML = `
    <div class="grid stats">
      <div class="stat-card"><span>Juegos en biblioteca</span><strong>${state.library.length}</strong><small>Library Service</small></div>
      <div class="stat-card"><span>Logros desbloqueados</span><strong>${state.achievements.filter(a=>a.unlocked).length}</strong><small>Achievement Service</small></div>
      <div class="stat-card"><span>Torneos inscritos</span><strong>${state.tournaments.filter(t=>t.registered).length}</strong><small>Tournament Service</small></div>
      <div class="stat-card"><span>Progreso promedio</span><strong>${avg}%</strong><small>Analytics Service</small></div>
    </div>
    <div class="dashboard-grid">
      <div class="panel">
        <h2>Biblioteca reciente</h2>
        <div class="list">
          ${state.library.map(i=>{
            const g=gameById(i.gameId);
            return `<div class="list-item"><div><strong>${g.title}</strong><div class="meta">${i.hours} h · ${i.status}</div></div><div style="min-width:160px"><div class="progress"><span style="width:${i.progress}%"></span></div><div class="meta" style="text-align:right">${i.progress}%</div></div></div>`
          }).join("")}
        </div>
      </div>
      <div class="panel">
        <h2>Actividad</h2>
        <div class="list">
          ${state.notifications.slice(0,4).map(n=>`<div class="list-item"><div>${escapeHtml(n.text)}</div><span class="badge">${n.unread?"Nueva":"Vista"}</span></div>`).join("")}
        </div>
      </div>
    </div>`;
}

function card(game, extraActions=""){
  const inLib = state.library.some(x=>x.gameId===game.id);
  const wish = state.wishlist.includes(game.id);
  return `<article class="game-card">
    <div class="cover" style="background:linear-gradient(135deg,${game.accent[0]},${game.accent[1]})"></div>
    <div class="game-body">
      <div class="game-meta">${game.genre} · ${game.platform}</div>
      <h3>${game.title}</h3>
      <p class="game-description">${game.description}</p>
      <div class="actions">
        <button class="btn small primary" data-addlib="${game.id}">${inLib?"En biblioteca":"Agregar"}</button>
        <button class="btn small" data-wish="${game.id}">${wish?"Quitar deseo":"♡ Deseos"}</button>
        ${extraActions}
      </div>
    </div>
  </article>`;
}

function bindGameActions(){
  document.querySelectorAll("[data-addlib]").forEach(b=>b.onclick=()=>{
    const id=+b.dataset.addlib;
    if(!state.library.some(x=>x.gameId===id)) state.library.push({gameId:id,progress:0,hours:0,status:"Pendiente"});
    saveState(); render(currentView);
  });
  document.querySelectorAll("[data-wish]").forEach(b=>b.onclick=()=>{
    const id=+b.dataset.wish;
    state.wishlist = state.wishlist.includes(id) ? state.wishlist.filter(x=>x!==id) : [...state.wishlist,id];
    saveState(); render(currentView);
  });
}

function renderCatalog(){
  document.getElementById("view").innerHTML = `
    <div class="section-head">
      <h2>Catálogo de videojuegos</h2>
      <div class="filters"><input id="search" placeholder="Buscar juego..."><select id="genre"><option value="">Todos los géneros</option>${[...new Set(state.games.map(g=>g.genre))].map(x=>`<option>${x}</option>`).join("")}</select></div>
    </div>
    <div id="catalogGrid" class="games-grid">${state.games.map(g=>card(g)).join("")}</div>`;
  const update=()=>{
    const q=document.getElementById("search").value.toLowerCase();
    const genre=document.getElementById("genre").value;
    const games=state.games.filter(g=>(!q||g.title.toLowerCase().includes(q))&&(!genre||g.genre===genre));
    document.getElementById("catalogGrid").innerHTML=games.map(g=>card(g)).join("");
    bindGameActions();
  };
  document.getElementById("search").oninput=update;
  document.getElementById("genre").onchange=update;
  bindGameActions();
}

function renderLibrary(){
  const html = state.library.length ? state.library.map(i=>{
    const g=gameById(i.gameId);
    return `<div class="panel">
      <div class="section-head"><div><h2>${g.title}</h2><span class="muted">${i.hours} horas jugadas</span></div><span class="badge">${i.status}</span></div>
      <div class="progress"><span style="width:${i.progress}%"></span></div>
      <div class="actions" style="margin-top:14px">
        <button class="btn small" data-progress="${g.id}" data-delta="10">+10% progreso</button>
        <button class="btn small" data-hours="${g.id}">+1 hora</button>
        <button class="btn small danger" data-remove="${g.id}">Quitar</button>
      </div>
    </div>`;
  }).join("") : `<div class="empty">Tu biblioteca está vacía.</div>`;
  document.getElementById("view").innerHTML=`<div class="grid">${html}</div>`;
  document.querySelectorAll("[data-progress]").forEach(b=>b.onclick=()=>{
    const i=state.library.find(x=>x.gameId===+b.dataset.progress); i.progress=Math.min(100,i.progress+10); if(i.progress===100)i.status="Completado"; saveState(); renderLibrary();
  });
  document.querySelectorAll("[data-hours]").forEach(b=>b.onclick=()=>{
    const i=state.library.find(x=>x.gameId===+b.dataset.hours); i.hours++; saveState(); renderLibrary();
  });
  document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{
    state.library=state.library.filter(x=>x.gameId!==+b.dataset.remove); saveState(); renderLibrary();
  });
}

function renderWishlist(){
  const games=state.games.filter(g=>state.wishlist.includes(g.id));
  document.getElementById("view").innerHTML = games.length ? `<div class="games-grid">${games.map(g=>card(g)).join("")}</div>` : `<div class="empty">No tienes juegos en tu lista de deseos.</div>`;
  bindGameActions();
}

function renderAchievements(){
  document.getElementById("view").innerHTML=`<div class="grid">${state.achievements.map(a=>`
    <div class="panel">
      <div class="section-head"><div><h2>${a.title}</h2><span class="muted">${a.game}</span></div><span class="badge">${a.xp} XP</span></div>
      <p>${a.unlocked?"Logro desbloqueado.":"Objetivo pendiente."}</p>
      ${a.unlocked?"":`<button class="btn primary" data-unlock="${a.id}">Simular desbloqueo</button>`}
    </div>`).join("")}</div>`;
  document.querySelectorAll("[data-unlock]").forEach(b=>b.onclick=()=>{
    const a=state.achievements.find(x=>x.id===+b.dataset.unlock); a.unlocked=true; state.profile.xp+=a.xp;
    state.notifications.unshift({id:Date.now(),text:`Desbloqueaste el logro ${a.title}.`,unread:true}); saveState(); renderAchievements();
  });
}

function renderTournaments(){
  document.getElementById("view").innerHTML=`<div class="grid">${state.tournaments.map(t=>`
    <div class="panel">
      <div class="section-head"><div><h2>${t.title}</h2><span class="muted">${t.game}</span></div><span class="badge">${t.joined}/${t.slots} cupos</span></div>
      <p>Premio: <strong>${t.prize}</strong></p>
      <button class="btn ${t.registered?"danger":"primary"}" data-tournament="${t.id}">${t.registered?"Cancelar registro":"Registrarme"}</button>
    </div>`).join("")}</div>`;
  document.querySelectorAll("[data-tournament]").forEach(b=>b.onclick=()=>{
    const t=state.tournaments.find(x=>x.id===+b.dataset.tournament);
    if(t.registered){ t.registered=false; t.joined=Math.max(0,t.joined-1); }
    else if(t.joined<t.slots){ t.registered=true; t.joined++; state.notifications.unshift({id:Date.now(),text:`Registro confirmado en ${t.title}.`,unread:true}); }
    saveState(); renderTournaments();
  });
}

function renderReviews(){
  document.getElementById("view").innerHTML=`
    <div class="two-col">
      <div class="panel">
        <h2>Reseñas de la comunidad</h2>
        <div class="list">${state.reviews.map(r=>`<div class="list-item"><div><strong>${gameById(r.gameId)?.title||"Juego"}</strong><div class="meta">${stars(r.rating)} · ${r.author}</div><div style="margin-top:6px">${escapeHtml(r.text)}</div></div></div>`).join("")}</div>
      </div>
      <div class="panel">
        <h2>Publicar reseña</h2>
        <form id="reviewForm" class="form">
          <label>Juego<select name="gameId">${state.games.map(g=>`<option value="${g.id}">${g.title}</option>`).join("")}</select></label>
          <label>Puntuación<select name="rating">${[5,4,3,2,1].map(x=>`<option value="${x}">${x} estrellas</option>`).join("")}</select></label>
          <label>Comentario<textarea name="text" required></textarea></label>
          <button class="btn primary">Publicar</button>
        </form>
      </div>
    </div>`;
  document.getElementById("reviewForm").onsubmit=e=>{
    e.preventDefault(); const fd=new FormData(e.currentTarget);
    state.reviews.unshift({id:Date.now(),gameId:+fd.get("gameId"),author:state.profile.name,rating:+fd.get("rating"),text:fd.get("text")});
    saveState(); renderReviews();
  };
}

function renderNotifications(){
  document.getElementById("view").innerHTML=`
    <div class="section-head"><h2>Centro de notificaciones</h2><button id="readAll" class="btn">Marcar todas como leídas</button></div>
    <div class="list">${state.notifications.map(n=>`<div class="list-item notice ${n.unread?"unread":""}"><div>${escapeHtml(n.text)}</div><span class="badge">${n.unread?"Nueva":"Leída"}</span></div>`).join("")}</div>`;
  document.getElementById("readAll").onclick=()=>{state.notifications.forEach(n=>n.unread=false);saveState();renderNotifications();};
}

function renderAnalytics(){
  const genreCounts={};
  state.library.forEach(i=>{ const g=gameById(i.gameId); if(g) genreCounts[g.genre]=(genreCounts[g.genre]||0)+1; });
  const max=Math.max(1,...Object.values(genreCounts));
  const totalHours=state.library.reduce((a,b)=>a+b.hours,0);
  document.getElementById("view").innerHTML=`
    <div class="grid stats">
      <div class="stat-card"><span>Horas totales</span><strong>${totalHours}</strong><small>Biblioteca</small></div>
      <div class="stat-card"><span>XP total</span><strong>${state.profile.xp}</strong><small>Perfil</small></div>
      <div class="stat-card"><span>Reseñas</span><strong>${state.reviews.length}</strong><small>Comunidad</small></div>
      <div class="stat-card"><span>Deseos</span><strong>${state.wishlist.length}</strong><small>Wishlist</small></div>
    </div>
    <div class="panel" style="margin-top:18px"><h2>Juegos por género</h2>
      <div class="chart-bars">${Object.entries(genreCounts).map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><strong>${v}</strong></div>`).join("")||'<div class="empty">Sin datos</div>'}</div>
    </div>`;
}

function renderProfile(){
  const level=Math.max(1,Math.floor(state.profile.xp/500));
  document.getElementById("view").innerHTML=`
    <div class="two-col">
      <div class="panel">
        <h2>${escapeHtml(state.profile.name)}</h2>
        <p class="muted">${escapeHtml(state.profile.bio)}</p>
        <div class="grid stats" style="grid-template-columns:1fr 1fr">
          <div class="stat-card"><span>Nivel</span><strong>${level}</strong></div>
          <div class="stat-card"><span>XP</span><strong>${state.profile.xp}</strong></div>
        </div>
      </div>
      <div class="panel">
        <h2>Editar perfil</h2>
        <form id="profileForm" class="form">
          <label>Nombre<input name="name" value="${escapeHtml(state.profile.name)}"></label>
          <label>Biografía<textarea name="bio">${escapeHtml(state.profile.bio)}</textarea></label>
          <button class="btn primary">Guardar cambios</button>
        </form>
      </div>
    </div>`;
  document.getElementById("profileForm").onsubmit=e=>{
    e.preventDefault(); const fd=new FormData(e.currentTarget); state.profile.name=fd.get("name"); state.profile.bio=fd.get("bio"); saveState(); renderProfile();
  };
}

render();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
