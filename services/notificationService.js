
const { readDB, writeDB } = require('./store');

function listNotifications() {
  return readDB().notifications;
}
function markAllRead() {
  const db = readDB();
  db.notifications.forEach(n => n.read = true);
  writeDB(db);
  return { ok:true };
}
module.exports = { listNotifications, markAllRead };
