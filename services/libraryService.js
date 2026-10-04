
const { readDB, writeDB } = require('./store');

function listLibrary() {
  const db = readDB();
  return db.library.map(item => ({
    ...item,
    game: db.games.find(g => g.id === item.gameId)
  }));
}
function addToLibrary(gameId) {
  const db = readDB();
  if (!db.games.some(g => g.id === gameId)) throw new Error('Juego no encontrado');
  if (db.library.some(i => i.gameId === gameId)) return db.library.find(i => i.gameId === gameId);
  const item = { gameId, status: 'Pendiente', hours: 0, progress: 0, lastPlayed: null };
  db.library.unshift(item);
  db.activity.unshift({ id:'EV'+Date.now(), type:'library', text:`Agregaste ${db.games.find(g=>g.id===gameId).title} a tu biblioteca.`, createdAt:new Date().toISOString() });
  db.notifications.unshift({ id:'N'+Date.now(), type:'library', title:'Juego agregado', text:`${db.games.find(g=>g.id===gameId).title} ahora está en tu biblioteca.`, read:false, createdAt:new Date().toISOString() });
  writeDB(db);
  return item;
}
function updateLibrary(gameId, payload) {
  const db = readDB();
  const item = db.library.find(i => i.gameId === gameId);
  if (!item) throw new Error('Juego no está en la biblioteca');
  if (payload.hours !== undefined) item.hours = Math.max(0, Number(payload.hours) || 0);
  if (payload.progress !== undefined) item.progress = Math.min(100, Math.max(0, Number(payload.progress) || 0));
  if (payload.status) item.status = payload.status;
  item.lastPlayed = new Date().toISOString().slice(0,10);
  if (item.progress === 100) item.status = 'Completado';
  writeDB(db);
  return item;
}
function removeFromLibrary(gameId) {
  const db = readDB();
  db.library = db.library.filter(i => i.gameId !== gameId);
  writeDB(db);
  return { ok:true };
}
function toggleWishlist(gameId) {
  const db = readDB();
  const idx = db.wishlist.indexOf(gameId);
  let wished;
  if (idx >= 0) { db.wishlist.splice(idx,1); wished = false; }
  else { db.wishlist.unshift(gameId); wished = true; }
  writeDB(db);
  return { wished, wishlist: db.wishlist };
}
function listWishlist() {
  const db = readDB();
  return db.wishlist.map(id => db.games.find(g => g.id === id)).filter(Boolean);
}
module.exports = { listLibrary, addToLibrary, updateLibrary, removeFromLibrary, toggleWishlist, listWishlist };
