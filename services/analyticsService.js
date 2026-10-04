
const { readDB } = require('./store');

function dashboard() {
  const db = readDB();
  const unlocked = db.achievements.filter(a => a.unlocked);
  const totalHours = db.library.reduce((sum, i) => sum + (i.hours || 0), 0);
  const avgProgress = db.library.length ? Math.round(db.library.reduce((s,i)=>s+(i.progress||0),0)/db.library.length) : 0;
  return {
    libraryCount: db.library.length,
    wishlistCount: db.wishlist.length,
    unlockedAchievements: unlocked.length,
    achievementPoints: unlocked.reduce((s,a)=>s+a.points,0),
    tournamentRegistrations: db.registrations.filter(r=>r.userId===db.profile.id).length,
    totalHours,
    avgProgress,
    unreadNotifications: db.notifications.filter(n=>!n.read).length,
    profile: db.profile,
    recentActivity: db.activity.slice(0,8)
  };
}
function analytics() {
  const db = readDB();
  const byGenre = {};
  db.library.forEach(item => {
    const game = db.games.find(g => g.id === item.gameId);
    if (game) byGenre[game.genre] = (byGenre[game.genre] || 0) + 1;
  });
  return {
    byGenre,
    progress: db.library.map(i => ({ title:db.games.find(g=>g.id===i.gameId)?.title || i.gameId, progress:i.progress, hours:i.hours })),
    achievements: {
      unlocked: db.achievements.filter(a=>a.unlocked).length,
      locked: db.achievements.filter(a=>!a.unlocked).length
    }
  };
}
module.exports = { dashboard, analytics };
