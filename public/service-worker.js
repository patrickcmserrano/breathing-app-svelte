// Arquivo de service worker para gerenciar notificações
const CACHE_NAME = 'webOasis-v1';

// Lista de recursos a serem armazenados em cache
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico'
];

// Instalação do service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Gerenciamento de notificações em segundo plano
self.addEventListener('push', (event) => {
  const title = 'WebOasis 4-7-8 Breathing';
  const options = {
    body: event.data ? event.data.text() : 'Hora da sua sessão de respiração!',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Ação ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Se já existe uma janela aberta com o app, foca nela
        for (const client of clientList) {
          if (client.url.includes('breathing-app') && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não existir, abre uma nova
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Verifica periodicamente se há notificações para enviar
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_NOTIFICATIONS') {
    const { times, mantra } = event.data;
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    console.log('[SW] Verificando notificações:', currentTime, times);
    
    if (times.includes(currentTime)) {
      console.log('[SW] Hora de notificação encontrada:', currentTime);
      
      self.registration.showNotification('WebOasis 4-7-8 Breathing', {
        body: mantra || 'Hora da sua sessão de respiração!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true
      });
    }
  }
});