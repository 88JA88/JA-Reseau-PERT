const NOM_CACHE = "ja-reseau-pert-coquille-v2";
const PREFIXE_CACHE = "ja-reseau-pert-coquille-";
const ENTREE_APPLICATION = new URL("./index.html", self.registration.scope).href;
const PAGE_ACCUEIL = new URL("./accueil.html", self.registration.scope).href;
const FICHIERS_APPLICATION = [
  "./index.html",
  "./accueil.html",
  "./manifest.webmanifest",
  "../output/pdf/NOTICE_UTILISATEUR_JA_RESEAU_PERT.pdf",
  "./assets/icons/ja-reseau-pert-180.png",
  "./assets/icons/ja-reseau-pert-192.png",
  "./assets/icons/ja-reseau-pert-512.png",
  "./assets/icons/ja-reseau-pert-1024.png"
].map((chemin) => new URL(chemin, self.registration.scope).href);

self.addEventListener("install", (evenement) => {
  evenement.waitUntil(
    caches.open(NOM_CACHE)
      .then((cache) => cache.addAll(FICHIERS_APPLICATION))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evenement) => {
  evenement.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(
        noms
          .filter((nom) => nom.startsWith(PREFIXE_CACHE) && nom !== NOM_CACHE)
          .map((nom) => caches.delete(nom))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evenement) => {
  const requete = evenement.request;
  if (requete.method !== "GET") return;

  const adresse = new URL(requete.url);
  if (adresse.origin !== self.location.origin) return;

  if (requete.mode === "navigate") {
    const pageDeRepli = adresse.href === PAGE_ACCUEIL ? PAGE_ACCUEIL : ENTREE_APPLICATION;
    evenement.respondWith(
      fetch(requete)
        .then((reponse) => reponse.ok ? reponse : caches.match(pageDeRepli).then((copie) => copie || reponse))
        .catch(() => caches.match(pageDeRepli))
    );
    return;
  }

  evenement.respondWith(
    caches.match(requete).then((reponseEnCache) => reponseEnCache || fetch(requete))
  );
});
