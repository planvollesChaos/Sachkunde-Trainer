// Offline-Speicher: Programm sofort, Bilder beim ersten Ansehen
// Bei jeder Änderung an den Dateien V erhöhen (und APPV in app.js bei Änderung an spiel-*.js / qr.js)
var V='sachkunde-2026-10-25-2';
var CORE=['./','index.html','app.js','daten.js','seiten.js','spiel-run.js','spiel-block.js','spiel-sudoku.js','qr.js','manifest.webmanifest','icon-192.png','bilder/kaninchen-winkt.webp','bilder/ergebnis-5.webp','bilder/profil-ellena.webp','bilder/profil-merle.webp','bilder/profil-eltern.webp'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  // Abgleich (Firebase) und andere fremde Adressen nie zwischenspeichern
  if(new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(fetch(e.request).then(function(r){if(r&&r.ok){var c=r.clone();caches.open(V).then(function(x){x.put(e.request,c)})}return r}).catch(function(){return caches.match(e.request)}));
});
