
const { readDB, writeDB } = require('./store');

function listReviews(gameId) {
  const db = readDB();
  return db.reviews.filter(r => !gameId || r.gameId === gameId).map(r => ({...r, game: db.games.find(g => g.id === r.gameId)}));
}
function createReview(payload) {
  const db = readDB();
  if (!db.games.some(g => g.id === payload.gameId)) throw new Error('Juego no encontrado');
  const rating = Math.min(5, Math.max(1, Number(payload.rating) || 5));
  const review = {
    id:'R'+Date.now(),
    gameId:payload.gameId,
    user:payload.user || db.profile.nickname,
    rating,
    text:String(payload.text || '').trim(),
    createdAt:new Date().toISOString()
  };
  if (!review.text) throw new Error('Escribe una reseña');
  db.reviews.unshift(review);
  writeDB(db);
  return review;
}
module.exports = { listReviews, createReview };
