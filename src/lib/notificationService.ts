import { userSessionStore } from '../stores/userSessionStore';
import { writable } from 'svelte/store';

// Store for subscription cleanup
let notificationCheckInterval: number | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;

// Store para status da última notificação
export const notificationStatus = writable<{
  lastChecked: string | null;
  lastSent: string | null;
  error: string | null;
  swRegistered: boolean;
}>({
  lastChecked: null,
  lastSent: null,
  error: null,
  swRegistered: false
});

// Registrar o service worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registrado com sucesso:', swRegistration);
      notificationStatus.update(s => ({ ...s, swRegistered: true }));
      return swRegistration;
    } catch (error) {
      console.error('Falha ao registrar o Service Worker:', error);
      notificationStatus.update(s => ({ 
        ...s, 
        error: `Falha ao registrar Service Worker: ${error}`,
        swRegistered: false
      }));
      return null;
    }
  } else {
    console.warn('Service Worker não suportado neste navegador');
    notificationStatus.update(s => ({ 
      ...s, 
      error: 'Service Worker não suportado neste navegador',
      swRegistered: false
    }));
    return null;
  }
};

// Request notification permissions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    notificationStatus.update(s => ({ ...s, error: 'Navegador não suporta notificações' }));
    return false;
  }
  
  // Registrar o service worker primeiro, se ainda não estiver registrado
  if (!swRegistration) {
    await registerServiceWorker();
  }
  
  if (Notification.permission === 'granted') {
    // Já tem permissão, iniciar o verificador de notificações
    setupNotificationChecker();
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Permissão concedida, iniciar o verificador de notificações
        setupNotificationChecker();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      notificationStatus.update(s => ({ ...s, error: `Erro ao solicitar permissão: ${error}` }));
      return false;
    }
  }
  
  return false;
};

// Send a notification with the mantra
export const sendNotification = (title: string, mantra: string): void => {
  if (Notification.permission === 'granted') {
    try {
      console.log('Enviando notificação:', title, mantra);
      
      // Tentar usar o service worker primeiro (preferido)
      if (swRegistration) {
        swRegistration.showNotification(title, { 
          body: mantra || 'Hora da sua sessão de respiração!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true,
          vibrate: [200, 100, 200]
        });
      } else {
        // Fallback para notificação nativa se não tivermos o service worker
        const notification = new Notification(title, { 
          body: mantra || 'Hora da sua sessão de respiração!',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
        
        // Fechar notificação após 30 segundos se não houver interação
        setTimeout(() => notification.close(), 30000);
        
        // Clique na notificação deve abrir o app
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
      
      // Atualiza o status com o horário de envio
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      notificationStatus.update(s => ({ 
        ...s, 
        lastSent: timeString,
        error: null
      }));
      
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      notificationStatus.update(s => ({ ...s, error: `Erro ao enviar notificação: ${error}` }));
    }
  } else {
    console.warn('Permissão de notificação não concedida. Status atual:', Notification.permission);
    notificationStatus.update(s => ({ ...s, error: `Permissão não concedida: ${Notification.permission}` }));
  }
};

// Send a test notification immediately
export const sendTestNotification = (): void => {
  sendNotification('Teste de Notificação', 'Esta é uma notificação de teste do WebOasis 4-7-8. Se você consegue ver esta mensagem, as notificações estão funcionando!');
};

// Check if there's a notification scheduled for the current time
export const checkCurrentTime = (): void => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;
  
  console.log('Verificando notificações no horário:', currentTime);
  
  // Atualiza o horário da última verificação
  notificationStatus.update(s => ({ ...s, lastChecked: now.toLocaleTimeString() }));
  
  let notificationTimes: string[] = [];
  let mantra = '';
  
  // Obter os horários de notificação e o mantra do armazenamento
  const unsubscribe = userSessionStore.subscribe(state => {
    notificationTimes = state.notificationTimes;
    mantra = state.mantra;
  });
  unsubscribe();
  
  // Se temos o service worker registrado, enviar uma mensagem para verificar notificações 
  // (funciona mesmo quando o app está em segundo plano)
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CHECK_NOTIFICATIONS',
      times: notificationTimes,
      mantra: mantra
    });
  }
  
  // Verificar também no contexto atual (para notificações imediatas quando o app está aberto)
  if (notificationTimes.includes(currentTime)) {
    console.log('Horário de notificação encontrado para:', currentTime);
    sendNotification('WebOasis 4-7-8 Breathing', mantra || 'Hora da sua sessão de respiração!');
  }
};

// Setup notification checker that runs every minute
export const setupNotificationChecker = async (): Promise<void> => {
  // Registrar service worker se ainda não estiver registrado
  if (!swRegistration) {
    swRegistration = await registerServiceWorker();
  }
  
  // Limpar qualquer intervalo existente
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
  }
  
  // Verificar imediatamente ao configurar as notificações
  checkCurrentTime();
  
  // Calcular milissegundos até o próximo minuto
  const now = new Date();
  const millisecondsUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  
  // Primeiro, definir um timeout para alinhar com o limite do minuto
  setTimeout(() => {
    // Executar verificação exatamente no limite do minuto
    checkCurrentTime();
    
    // Em seguida, definir o intervalo para ser executado a cada minuto exatamente no minuto
    notificationCheckInterval = window.setInterval(checkCurrentTime, 60000);
  }, millisecondsUntilNextMinute);
  
  console.log(`Configuração do verificador de notificações concluída. Próxima verificação em ${millisecondsUntilNextMinute}ms`);
};

// Clean up notification checker on app unmount
export const cleanupNotificationChecker = (): void => {
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
    notificationCheckInterval = null;
    console.log('Verificador de notificações limpo');
  }
};