// Naikkan angka versi ini setiap kali kamu update game (biar HP pemain sadar ada versi baru)
const CACHE='ref-v13';
const CORE=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png','fonts/manrope-500.woff2','fonts/manrope-700.woff2','fonts/cormorant-600-italic.woff2'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const same=u.origin===location.origin;
  if(!same)return;
  // halaman utama: ambil versi terbaru dulu, kalau offline pakai cache
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
    return;
  }
  // lainnya: pakai cache dulu, perbarui di belakang layar
  e.respondWith(caches.match(r).then(m=>{
    const net=fetch(r).then(res=>{if(res&&res.status===200){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>m);
    return m||net;
  }));
});
