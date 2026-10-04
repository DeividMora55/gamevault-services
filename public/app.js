
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let state = {
  dashboard:null, games:[], library:[], wishlist:[], achievements:[], tournaments:[],
  reviews:[], notifications:[], analytics:null, profile:null
};

const refs = {
  statsGrid:$('#statsGrid'), continuePlaying:$('#continuePlaying'), profileProgress:$('#profileProgress'),
  activityFeed:$('#activityFeed'), dashboardTournaments:$('#dashboardTournaments'),
  gameGrid:$('#gameGrid'), gameSearch:$('#gameSearch'), genreFilter:$('#genreFilter'), platformFilter:$('#platformFilter'),
  libraryGrid:$('#libraryGrid'), wishlistList:$('#wishlistList'),
  achievementSummary:$('#achievementSummary'), achievementGrid:$('#achievementGrid'),
  tournamentGrid:$('#tournamentGrid'), reviewGame:$('#reviewGame'), reviewRating:$('#reviewRating'),
  reviewText:$('#reviewText'), publishReviewBtn:$('#publishReviewBtn'), reviewFeed:$('#reviewFeed'),
  sidebarProfile:$('#sidebarProfile'), topNickname:$('#topNickname'), notifCount:$('#notifCount'),
  notificationBtn:$('#notificationBtn'), notificationDrawer:$('#notificationDrawer'), closeDrawer:$('#closeDrawer'),
  markReadBtn:$('#markReadBtn'), notificationList:$('#notificationList'),
  gameDialog:$('#gameDialog'), gameDialogBody:$('#gameDialogBody'),
  libraryDialog:$('#libraryDialog'), libraryForm:$('#libraryForm'), libraryDialogTitle:$('#libraryDialogTitle'),
  libraryGameId:$('#libraryGameId'), libraryStatus:$('#libraryStatus'), libraryHours:$('#libraryHours'), libraryProgress:$('#libraryProgress'),
  testHealthBtn:$('#testHealthBtn'), healthResult:$('#healthResult'), toast:$('#toast'),
  pageEyebrow:$('#pageEyebrow'), pageTitle:$('#pageTitle')
};

init();

async function init(){
  bind();
  await refreshAll();
}

function bind(){
  $$('.nav-btn').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.go)));
  refs.gameSearch.addEventListener('input', renderGames);
  refs.genreFilter.addEventListener('change', renderGames);
  refs.platformFilter.addEventListener('change', renderGames);
  refs.publishReviewBtn.addEventListener('click', publishReview);
  refs.notificationBtn.addEventListener('click',()=>refs.notificationDrawer.classList.add('open'));
  refs.closeDrawer.addEventListener('click',()=>refs.notificationDrawer.classList.remove('open'));
  refs.markReadBtn.addEventListener('click', markAllRead);
  refs.libraryForm.addEventListener('submit', updateLibrary);
  refs.testHealthBtn.addEventListener('click', testHealth);
  $$('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
}

async function api(path, options={}){
  const res = await fetch(path,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  const data = await res.json();
  if(!res.ok) throw new Error(data.error || 'Error de servicio');
  return data;
}

async function refreshAll(){
  try{
    const [dashboard,games,library,wishlist,achievements,tournaments,reviews,notifications,analytics,profile] = await Promise.all([
      api('/api/dashboard'),api('/api/games'),api('/api/library'),api('/api/wishlist'),
      api('/api/achievements'),api('/api/tournaments'),api('/api/reviews'),api('/api/notifications'),
      api('/api/analytics'),api('/api/profile')
    ]);
    Object.assign(state,{dashboard,games,library,wishlist,achievements,tournaments,reviews,notifications,analytics,profile});
    renderAll();
  }catch(err){showToast(err.message)}
}

function renderAll(){
  renderProfile(); renderDashboard(); renderGames(); renderLibrary(); renderAchievements();
  renderTournaments(); renderReviews(); renderNotifications(); fillReviewGames();
}

function switchView(name){
  const titles={
    dashboard:['GAMEVAULT SERVICES','Centro de mando'],
    discover:['CATALOG SERVICE','Descubrir juegos'],
    library:['LIBRARY SERVICE','Mi biblioteca'],
    achievements:['ACHIEVEMENT SERVICE','Logros y recompensas'],
    tournaments:['TOURNAMENT SERVICE','Arena competitiva'],
    community:['REVIEW SERVICE','Comunidad'],
    services:['SERVICE ARCHITECTURE','Servicios API']
  };
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===`${name}View`));
  $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  refs.pageEyebrow.textContent=titles[name]?.[0]||'GAMEVAULT';
  refs.pageTitle.textContent=titles[name]?.[1]||'GameVault';
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderProfile(){
  const p=state.profile;
  if(!p)return;
  refs.topNickname.textContent=p.nickname;
  const pct=Math.min(100,Math.round((p.xp/p.nextLevelXp)*100));
  refs.sidebarProfile.innerHTML=`
    <div class="side-profile-row"><div class="side-avatar">${initials(p.nickname)}</div><div><strong>${esc(p.nickname)}</strong><span>Nivel ${p.level}</span></div></div>
    <div class="side-level"><div class="level-row"><span>${p.xp} XP</span><span>${p.nextLevelXp}</span></div><div class="level-track"><div class="level-fill" style="width:${pct}%"></div></div></div>`;
}

function renderDashboard(){
  const d=state.dashboard;if(!d)return;
  const stats=[
    ['Biblioteca',d.libraryCount,'juegos'],
    ['Horas jugadas',d.totalHours,'horas'],
    ['Logros',d.unlockedAchievements,'desbloqueados'],
    ['Puntos',d.achievementPoints,'achievement pts'],
    ['Torneos',d.tournamentRegistrations,'registros'],
    ['Progreso medio',d.avgProgress+'%','biblioteca']
  ];
  refs.statsGrid.innerHTML=stats.map(([a,b,c])=>`<article class="stat-card"><span>${a}</span><strong>${b}</strong><small>${c}</small></article>`).join('');

  refs.continuePlaying.innerHTML=state.library.slice(0,4).map(item=>`
    <div class="continue-item">
      <div class="game-thumb" style="background:linear-gradient(135deg,${item.game.accent},#120b21)">${shortCode(item.game.title)}</div>
      <div><h4>${esc(item.game.title)}</h4><small>${item.hours} h · ${esc(item.status)}</small>
      <div class="progress-row"><div class="mini-progress"><div style="width:${item.progress}%"></div></div><span>${item.progress}%</span></div></div>
      <span class="play-tag">Continuar</span>
    </div>`).join('') || empty('Aún no hay juegos en la biblioteca.');

  const p=state.profile,pct=Math.min(100,Math.round((p.xp/p.nextLevelXp)*100));
  refs.profileProgress.innerHTML=`<div class="profile-card"><div class="big-avatar">${initials(p.nickname)}</div><h3>${esc(p.nickname)}</h3><p>${esc(p.bio)}</p><span class="rank-pill">${esc(p.rank)}</span><div class="xp-line"><span>Nivel ${p.level}</span><span>${p.xp}/${p.nextLevelXp} XP</span></div><div class="xp-track"><div style="width:${pct}%"></div></div></div>`;

  refs.activityFeed.innerHTML=(d.recentActivity||[]).map(ev=>`<div class="timeline-item"><span class="timeline-dot"></span><div><p>${esc(ev.text)}</p><small>${formatDateTime(ev.createdAt)}</small></div></div>`).join('')||empty('Sin actividad reciente.');

  refs.dashboardTournaments.innerHTML=state.tournaments.slice(0,3).map(t=>`<div class="mini-tournament"><h4>${esc(t.name)}</h4><small>${esc(t.game?.title||'')} · ${formatDate(t.date)} · ${t.registered}/${t.slots} lugares</small></div>`).join('');
}

function renderGames(){
  const q=refs.gameSearch.value.trim().toLowerCase(),genre=refs.genreFilter.value,platform=refs.platformFilter.value;
  const libIds=new Set(state.library.map(i=>i.gameId)),wishIds=new Set(state.wishlist.map(g=>g.id));
  const filtered=state.games.filter(g=>{
    const mq=[g.title,g.genre,g.platform,...(g.tags||[])].join(' ').toLowerCase().includes(q);
    return mq&&(genre==='Todos'||g.genre===genre)&&(platform==='Todas'||g.platform.includes(platform));
  });
  refs.gameGrid.innerHTML=filtered.map(g=>`
    <article class="game-card">
      <div class="cover" style="--cover-bg:linear-gradient(135deg,${g.accent},#120b21)"><span class="cover-code">${shortCode(g.title)}</span></div>
      <div class="game-card-body">
        <div class="meta-line"><span>${esc(g.genre)}</span><span>★ ${g.rating}</span></div>
        <h3>${esc(g.title)}</h3>
        <div class="tags">${g.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="meta-line"><span>${esc(g.platform)}</span><span>${g.price?money(g.price):'Gratis'}</span></div>
        <div class="card-actions">
          <button class="small-btn" onclick="showGame('${g.id}')">Detalles</button>
          <button class="small-btn accent" onclick="addToLibrary('${g.id}')" ${libIds.has(g.id)?'disabled':''}>${libIds.has(g.id)?'En biblioteca':'Agregar'}</button>
          <button class="wish-btn ${wishIds.has(g.id)?'active':''}" onclick="toggleWishlist('${g.id}')" title="Lista de deseos">♥</button>
        </div>
      </div>
    </article>`).join('')||empty('No se encontraron juegos.');
}

function renderLibrary(){
  refs.libraryGrid.innerHTML=state.library.map(item=>`
    <article class="library-card">
      <div class="library-top"><div class="library-cover" style="background:linear-gradient(135deg,${item.game.accent},#120b21)">${shortCode(item.game.title)}</div><div><h3>${esc(item.game.title)}</h3><p>${esc(item.game.genre)} · ${esc(item.status)}</p><p>${item.hours} horas jugadas</p></div></div>
      <div class="library-progress"><div class="lib-progress-head"><span>Progreso</span><strong>${item.progress}%</strong></div><div class="lib-track"><div style="width:${item.progress}%"></div></div></div>
      <div class="library-actions"><button class="small-btn accent" onclick="openLibraryEdit('${item.gameId}')">Actualizar</button><button class="small-btn" onclick="removeFromLibrary('${item.gameId}')">Quitar</button></div>
    </article>`).join('')||empty('Tu biblioteca está vacía.');

  refs.wishlistList.innerHTML=state.wishlist.map(g=>`<div class="wishlist-item"><strong>${esc(g.title)}</strong><span>${esc(g.genre)} · ${g.price?money(g.price):'Gratis'}</span><div class="library-actions"><button class="small-btn accent" onclick="addToLibrary('${g.id}')">Agregar</button><button class="small-btn" onclick="toggleWishlist('${g.id}')">Quitar</button></div></div>`).join('')||empty('Lista de deseos vacía.');
}

function renderAchievements(){
  const unlocked=state.achievements.filter(a=>a.unlocked),points=unlocked.reduce((s,a)=>s+a.points,0);
  refs.achievementSummary.innerHTML=[
    ['Desbloqueados',`${unlocked.length}/${state.achievements.length}`],
    ['Puntos obtenidos',points],
    ['Progreso',state.achievements.length?Math.round(unlocked.length/state.achievements.length*100)+'%':'0%']
  ].map(([a,b])=>`<div class="summary-card"><span>${a}</span><strong>${b}</strong></div>`).join('');
  refs.achievementGrid.innerHTML=state.achievements.map(a=>`
    <article class="achievement-card ${a.unlocked?'':'locked'}">
      <div class="achievement-icon">${a.unlocked?'★':'🔒'}</div>
      <h3>${esc(a.name)}</h3><span class="review-game">${esc(a.game?.title||'')}</span>
      <p>${esc(a.description)}</p>
      <div class="ach-meta"><span>${esc(a.rarity)}</span><strong>+${a.points} XP</strong></div>
      <button class="unlock-btn" ${a.unlocked?'disabled':''} onclick="unlockAchievement('${a.id}')">${a.unlocked?'Desbloqueado':'Simular desbloqueo'}</button>
    </article>`).join('');
}

function renderTournaments(){
  refs.tournamentGrid.innerHTML=state.tournaments.map(t=>{
    const pct=Math.min(100,Math.round(t.registered/t.slots*100));
    return `<article class="tournament-card">
      <div class="tournament-banner" style="--accent:${t.game?.accent||'#8b5cf6'}"><strong>${shortCode(t.game?.title||'GV')}</strong></div>
      <div class="tournament-body"><span class="review-game">${esc(t.game?.title||'')}</span><h3>${esc(t.name)}</h3>
      <div class="tournament-info"><div class="info-box"><span>Fecha</span><strong>${formatDate(t.date)}</strong></div><div class="info-box"><span>Premio</span><strong>${esc(t.prize)}</strong></div></div>
      <div class="slot-line"><span>Cupos</span><span>${t.registered}/${t.slots}</span></div><div class="slot-track"><div style="width:${pct}%"></div></div>
      <button class="btn ${t.isRegistered?'glass-dark':'primary'} full" style="margin-top:14px" onclick="${t.isRegistered?`unregisterTournament('${t.id}')`:`registerTournament('${t.id}')`}" ${t.registered>=t.slots&&!t.isRegistered?'disabled':''}>${t.isRegistered?'Cancelar registro':t.registered>=t.slots?'Cupo lleno':'Registrarme'}</button></div>
    </article>`;
  }).join('');
}

function fillReviewGames(){
  refs.reviewGame.innerHTML=state.games.map(g=>`<option value="${g.id}">${esc(g.title)}</option>`).join('');
}

function renderReviews(){
  refs.reviewFeed.innerHTML=state.reviews.map(r=>`
    <article class="review-card">
      <div class="review-head"><div><strong>${esc(r.user)}</strong><span>${formatDateTime(r.createdAt)}</span></div><div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div></div>
      <p>${esc(r.text)}</p><span class="review-game">${esc(r.game?.title||'')}</span>
    </article>`).join('')||empty('Aún no hay reseñas.');
}

function renderNotifications(){
  const unread=state.notifications.filter(n=>!n.read).length;
  refs.notifCount.textContent=unread;
  refs.notificationList.innerHTML=state.notifications.map(n=>`
    <div class="notification-item ${n.read?'':'unread'}"><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p><small>${formatDateTime(n.createdAt)}</small></div>`).join('')||empty('Sin notificaciones.');
}

async function showGame(id){
  try{
    const g=await api(`/api/games/${id}`);
    const inLib=state.library.some(i=>i.gameId===id),wished=state.wishlist.some(x=>x.id===id);
    refs.gameDialogBody.innerHTML=`
      <div class="modal-cover" style="background:linear-gradient(135deg,${g.accent},#120b21)">${shortCode(g.title)}</div>
      <p class="eyebrow">${esc(g.genre)} · ${esc(g.platform)}</p><h2>${esc(g.title)}</h2>
      <p class="modal-desc">${esc(g.description)}</p>
      <div class="modal-meta"><div><span>Valoración</span><strong>★ ${g.rating}</strong></div><div><span>Jugadores</span><strong>${esc(g.players)}</strong></div><div><span>Precio</span><strong>${g.price?money(g.price):'Gratis'}</strong></div></div>
      <div class="card-actions"><button class="btn primary" onclick="addToLibrary('${g.id}')" ${inLib?'disabled':''}>${inLib?'Ya está en biblioteca':'Agregar a biblioteca'}</button><button class="btn glass-dark" onclick="toggleWishlist('${g.id}')">${wished?'Quitar de deseos':'Agregar a deseos'}</button></div>`;
    refs.gameDialog.showModal();
  }catch(e){showToast(e.message)}
}

async function addToLibrary(gameId){
  try{await api('/api/library',{method:'POST',body:JSON.stringify({gameId})});showToast('Juego agregado mediante Library Service.');await refreshAll();}catch(e){showToast(e.message)}
}
async function toggleWishlist(gameId){
  try{await api('/api/wishlist/toggle',{method:'POST',body:JSON.stringify({gameId})});await refreshAll();}catch(e){showToast(e.message)}
}
async function removeFromLibrary(gameId){
  if(!confirm('¿Quitar este juego de tu biblioteca?'))return;
  try{await api(`/api/library/${gameId}`,{method:'DELETE'});showToast('Juego eliminado de la biblioteca.');await refreshAll();}catch(e){showToast(e.message)}
}
function openLibraryEdit(gameId){
  const item=state.library.find(i=>i.gameId===gameId);if(!item)return;
  refs.libraryGameId.value=gameId;refs.libraryStatus.value=item.status;refs.libraryHours.value=item.hours;refs.libraryProgress.value=item.progress;
  refs.libraryDialogTitle.textContent=`Actualizar: ${item.game.title}`;refs.libraryDialog.showModal();
}
async function updateLibrary(e){
  e.preventDefault();
  try{await api(`/api/library/${refs.libraryGameId.value}`,{method:'PUT',body:JSON.stringify({status:refs.libraryStatus.value,hours:Number(refs.libraryHours.value),progress:Number(refs.libraryProgress.value)})});refs.libraryDialog.close();showToast('Progreso actualizado.');await refreshAll();}catch(err){showToast(err.message)}
}
async function unlockAchievement(id){
  try{await api(`/api/achievements/${id}/unlock`,{method:'POST'});showToast('Logro desbloqueado: XP actualizado.');await refreshAll();}catch(e){showToast(e.message)}
}
async function registerTournament(id){
  try{await api(`/api/tournaments/${id}/register`,{method:'POST'});showToast('Registro al torneo confirmado.');await refreshAll();}catch(e){showToast(e.message)}
}
async function unregisterTournament(id){
  try{await api(`/api/tournaments/${id}/unregister`,{method:'POST'});showToast('Registro cancelado.');await refreshAll();}catch(e){showToast(e.message)}
}
async function publishReview(){
  const text=refs.reviewText.value.trim();if(!text)return showToast('Escribe una reseña.');
  try{await api('/api/reviews',{method:'POST',body:JSON.stringify({gameId:refs.reviewGame.value,rating:Number(refs.reviewRating.value),text,user:state.profile.nickname})});refs.reviewText.value='';showToast('Reseña publicada mediante Review Service.');await refreshAll();}catch(e){showToast(e.message)}
}
async function markAllRead(){
  try{await api('/api/notifications/read-all',{method:'POST'});await refreshAll();}catch(e){showToast(e.message)}
}
async function testHealth(){
  try{const data=await api('/api/health');refs.healthResult.textContent=JSON.stringify(data,null,2);}catch(e){refs.healthResult.textContent=e.message}
}

function empty(text){return `<div style="padding:22px;color:#9d92b7;border:1px dashed #33224d;border-radius:13px">${esc(text)}</div>`}
function money(v){return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)}
function formatDate(v){return new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${v}T12:00:00`))}
function formatDateTime(v){return new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}
function shortCode(title){return title.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function initials(v){return String(v).split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function showToast(msg){refs.toast.textContent=msg;refs.toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>refs.toast.classList.remove('show'),2400)}

window.showGame=showGame;window.addToLibrary=addToLibrary;window.toggleWishlist=toggleWishlist;window.removeFromLibrary=removeFromLibrary;window.openLibraryEdit=openLibraryEdit;window.unlockAchievement=unlockAchievement;window.registerTournament=registerTournament;window.unregisterTournament=unregisterTournament;
