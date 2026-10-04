
const { readDB, writeDB } = require('./store');

function listTournaments() {
  const db = readDB();
  return db.tournaments.map(t => ({
    ...t,
    game: db.games.find(g => g.id === t.gameId),
    isRegistered: db.registrations.some(r => r.tournamentId === t.id && r.userId === db.profile.id)
  }));
}
function register(tournamentId) {
  const db = readDB();
  const t = db.tournaments.find(x => x.id === tournamentId);
  if (!t) throw new Error('Torneo no encontrado');
  if (t.registered >= t.slots) throw new Error('El torneo está lleno');
  if (db.registrations.some(r => r.tournamentId === tournamentId && r.userId === db.profile.id)) {
    return { alreadyRegistered:true };
  }
  db.registrations.unshift({ tournamentId, userId:db.profile.id, registeredAt:new Date().toISOString() });
  t.registered += 1;
  db.notifications.unshift({ id:'N'+Date.now(), type:'tournament', title:'Registro confirmado', text:`Tu lugar en ${t.name} está confirmado.`, read:false, createdAt:new Date().toISOString() });
  db.activity.unshift({ id:'EV'+Date.now(), type:'tournament', text:`Te registraste en ${t.name}.`, createdAt:new Date().toISOString() });
  writeDB(db);
  return { registered:true };
}
function unregister(tournamentId) {
  const db = readDB();
  const before = db.registrations.length;
  db.registrations = db.registrations.filter(r => !(r.tournamentId === tournamentId && r.userId === db.profile.id));
  const t = db.tournaments.find(x => x.id === tournamentId);
  if (t && db.registrations.length < before) t.registered = Math.max(0, t.registered - 1);
  writeDB(db);
  return { registered:false };
}
module.exports = { listTournaments, register, unregister };
