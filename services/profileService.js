
const { readDB, writeDB } = require('./store');

function getProfile() {
  const db = readDB();
  return db.profile;
}
function updateProfile(payload) {
  const db = readDB();
  Object.assign(db.profile, {
    name: payload.name ?? db.profile.name,
    nickname: payload.nickname ?? db.profile.nickname,
    bio: payload.bio ?? db.profile.bio,
    favoriteGenre: payload.favoriteGenre ?? db.profile.favoriteGenre
  });
  writeDB(db);
  return db.profile;
}
module.exports = { getProfile, updateProfile };
