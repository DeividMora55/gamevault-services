
const { readDB, writeDB } = require('./store');

function listAchievements() {
  const db = readDB();
  return db.achievements.map(a => ({...a, game: db.games.find(g => g.id === a.gameId)}));
}
function unlockAchievement(id) {
  const db = readDB();
  const achievement = db.achievements.find(a => a.id === id);
  if (!achievement) throw new Error('Logro no encontrado');
  if (!achievement.unlocked) {
    achievement.unlocked = true;
    db.profile.xp += achievement.points;
    const game = db.games.find(g => g.id === achievement.gameId);
    db.notifications.unshift({ id:'N'+Date.now(), type:'achievement', title:'Logro desbloqueado', text:`${achievement.name} · +${achievement.points} XP`, read:false, createdAt:new Date().toISOString() });
    db.activity.unshift({ id:'EV'+Date.now(), type:'achievement', text:`Desbloqueaste “${achievement.name}” en ${game?.title || 'un juego'}.`, createdAt:new Date().toISOString() });
    writeDB(db);
  }
  return achievement;
}
module.exports = { listAchievements, unlockAchievement };
