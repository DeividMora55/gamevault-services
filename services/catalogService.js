
const { readDB } = require('./store');

function listGames(query = {}) {
  const db = readDB();
  let games = db.games;
  if (query.genre && query.genre !== 'Todos') games = games.filter(g => g.genre === query.genre);
  if (query.platform && query.platform !== 'Todas') games = games.filter(g => g.platform.includes(query.platform));
  if (query.search) {
    const q = query.search.toLowerCase();
    games = games.filter(g => [g.title, g.genre, g.platform, ...(g.tags || [])].join(' ').toLowerCase().includes(q));
  }
  return games;
}
function getGame(id) {
  const db = readDB();
  const game = db.games.find(g => g.id === id);
  if (!game) throw new Error('Juego no encontrado');
  return game;
}
module.exports = { listGames, getGame };
