
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const catalogService = require('./services/catalogService');
const libraryService = require('./services/libraryService');
const achievementService = require('./services/achievementService');
const tournamentService = require('./services/tournamentService');
const reviewService = require('./services/reviewService');
const profileService = require('./services/profileService');
const notificationService = require('./services/notificationService');
const analyticsService = require('./services/analyticsService');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store'
  });
  res.end(JSON.stringify(data));
}
function bodyJSON(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new Error('JSON inválido')); }
    });
  });
}
function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  let rel = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
  const filePath = path.normalize(path.join(PUBLIC, rel));
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); return res.end('Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html':'text/html; charset=utf-8',
      '.css':'text/css; charset=utf-8',
      '.js':'application/javascript; charset=utf-8',
      '.svg':'image/svg+xml',
      '.json':'application/json; charset=utf-8',
      '.webmanifest':'application/manifest+json'
    };
    res.writeHead(200, {'Content-Type':types[ext] || 'application/octet-stream'});
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const p = parsed.pathname;
  try {
    if (p === '/api/health' && req.method === 'GET')
      return sendJSON(res, 200, {
        status:'ok',
        application:'GameVault Services',
        architecture:'service-oriented',
        services:8,
        timestamp:new Date().toISOString()
      });

    if (p === '/api/dashboard' && req.method === 'GET')
      return sendJSON(res, 200, analyticsService.dashboard());
    if (p === '/api/analytics' && req.method === 'GET')
      return sendJSON(res, 200, analyticsService.analytics());

    if (p === '/api/games' && req.method === 'GET')
      return sendJSON(res, 200, catalogService.listGames(parsed.query));
    const gameMatch = p.match(/^\/api\/games\/([^/]+)$/);
    if (gameMatch && req.method === 'GET')
      return sendJSON(res, 200, catalogService.getGame(gameMatch[1]));

    if (p === '/api/library' && req.method === 'GET')
      return sendJSON(res, 200, libraryService.listLibrary());
    if (p === '/api/library' && req.method === 'POST')
      return sendJSON(res, 201, libraryService.addToLibrary((await bodyJSON(req)).gameId));
    const libraryMatch = p.match(/^\/api\/library\/([^/]+)$/);
    if (libraryMatch && req.method === 'PUT')
      return sendJSON(res, 200, libraryService.updateLibrary(libraryMatch[1], await bodyJSON(req)));
    if (libraryMatch && req.method === 'DELETE')
      return sendJSON(res, 200, libraryService.removeFromLibrary(libraryMatch[1]));

    if (p === '/api/wishlist' && req.method === 'GET')
      return sendJSON(res, 200, libraryService.listWishlist());
    if (p === '/api/wishlist/toggle' && req.method === 'POST')
      return sendJSON(res, 200, libraryService.toggleWishlist((await bodyJSON(req)).gameId));

    if (p === '/api/achievements' && req.method === 'GET')
      return sendJSON(res, 200, achievementService.listAchievements());
    const achMatch = p.match(/^\/api\/achievements\/([^/]+)\/unlock$/);
    if (achMatch && req.method === 'POST')
      return sendJSON(res, 200, achievementService.unlockAchievement(achMatch[1]));

    if (p === '/api/tournaments' && req.method === 'GET')
      return sendJSON(res, 200, tournamentService.listTournaments());
    const regMatch = p.match(/^\/api\/tournaments\/([^/]+)\/register$/);
    if (regMatch && req.method === 'POST')
      return sendJSON(res, 200, tournamentService.register(regMatch[1]));
    const unregMatch = p.match(/^\/api\/tournaments\/([^/]+)\/unregister$/);
    if (unregMatch && req.method === 'POST')
      return sendJSON(res, 200, tournamentService.unregister(unregMatch[1]));

    if (p === '/api/reviews' && req.method === 'GET')
      return sendJSON(res, 200, reviewService.listReviews(parsed.query.gameId));
    if (p === '/api/reviews' && req.method === 'POST')
      return sendJSON(res, 201, reviewService.createReview(await bodyJSON(req)));

    if (p === '/api/profile' && req.method === 'GET')
      return sendJSON(res, 200, profileService.getProfile());
    if (p === '/api/profile' && req.method === 'PUT')
      return sendJSON(res, 200, profileService.updateProfile(await bodyJSON(req)));

    if (p === '/api/notifications' && req.method === 'GET')
      return sendJSON(res, 200, notificationService.listNotifications());
    if (p === '/api/notifications/read-all' && req.method === 'POST')
      return sendJSON(res, 200, notificationService.markAllRead());

    if (p.startsWith('/api/'))
      return sendJSON(res, 404, { error:'Endpoint no encontrado' });

    return serveStatic(req, res);
  } catch (err) {
    return sendJSON(res, 400, { error:err.message });
  }
});

server.listen(PORT, () => {
  console.log(`GameVault Services disponible en http://localhost:${PORT}`);
  console.log(`API health: http://localhost:${PORT}/api/health`);
});
