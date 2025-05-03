<script lang="ts">
  import { onMount } from 'svelte';
  import { userSessionStore } from '../stores/userSessionStore';
  import { requestNotificationPermission, checkCurrentTime, setupNotificationChecker, cleanupNotificationChecker, sendTestNotification, notificationStatus, registerServiceWorker } from '../lib/notificationService';
  import { _ } from 'svelte-i18n';
  
  let notificationTimes: string[] = [];
  let newTime = '';
  let permissionStatus = '';
  let editingTime: { original: string, value: string } | null = null;
  let deleteConfirmation: string | null = null; // Para controlar qual horário está em confirmação de exclusão
  let status = { lastChecked: null, lastSent: null, error: null, swRegistered: false };
  let debugInfo = '';
  
  // Subscribe to the store to get notification times
  const unsubscribe = userSessionStore.subscribe(state => {
    notificationTimes = state.notificationTimes;
  });
  
  // Subscribe to the notification status
  const unsubscribeStatus = notificationStatus.subscribe(s => {
    status = s;
  });
  
  // Check notification permission status on mount
  onMount(async () => {
    await checkPermission();
    
    // Inicializa o verificador de notificações se a permissão já foi concedida
    if (Notification.permission === 'granted') {
      // Tentar registrar o service worker primeiro
      await registerServiceWorker();
      setupNotificationChecker();
    }
    
    // Verificar o estado do service worker
    checkServiceWorkerStatus();
    
    return () => {
      unsubscribe();
      unsubscribeStatus();
      // Limpa o verificador de notificações quando o componente é desmontado
      cleanupNotificationChecker();
    };
  });
  
  // Check notification permission
  async function checkPermission() {
    if (!('Notification' in window)) {
      permissionStatus = 'unsupported';
      return;
    }
    
    permissionStatus = Notification.permission;
  }
  
  // Request notification permission
  async function requestPermission() {
    const granted = await requestNotificationPermission();
    permissionStatus = granted ? 'granted' : 'denied';
    
    // Se a permissão foi concedida, inicializa o verificador de notificações
    if (granted) {
      setupNotificationChecker();
    }
  }
  
  // Test notification
  function testNotification() {
    sendTestNotification();
  }
  
  // Check Service Worker status
  async function checkServiceWorkerStatus() {
    let statusText = '';
    
    if (!('serviceWorker' in navigator)) {
      statusText = 'ServiceWorker API não é suportada neste navegador.';
    } else {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        statusText = `ServiceWorker registrado: ${registrations.length > 0 ? 'Sim' : 'Não'}\n`;
        if (registrations.length > 0) {
          statusText += `Número de registros: ${registrations.length}\n`;
          registrations.forEach((reg, i) => {
            statusText += `Registro ${i+1}:\n`;
            statusText += `  Escopo: ${reg.scope}\n`;
            statusText += `  Estado de atualização: ${reg.updateViaCache}\n`;
            statusText += `  Estado: ${reg.active ? 'Ativo' : 'Inativo'}\n`;
          });
        }
        
        if (navigator.serviceWorker.controller) {
          statusText += `Controller: ${navigator.serviceWorker.controller.scriptURL}\n`;
        } else {
          statusText += 'Controller: Nenhum\n';
        }
      } catch (error) {
        statusText = `Erro ao verificar Service Worker: ${error}`;
      }
    }
    
    debugInfo = statusText;
    console.log('Status do Service Worker:', statusText);
  }
  
  // Add a new notification time
  function addTime() {
    if (newTime && !notificationTimes.includes(newTime)) {
      userSessionStore.addNotificationTime(newTime);
      
      // Check immediately if the time we just added matches the current time
      checkCurrentTime();
      
      // Display feedback that the notification was added
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHour}:${currentMinute}`;
      
      if (newTime === currentTimeString) {
        console.log('Notification time matches current time. A notification should appear shortly.');
      }
      
      newTime = '';
    }
  }
  
  // Manual check for notifications
  function forceCheckNotifications() {
    console.log('Verificação manual de notificações iniciada');
    checkCurrentTime();
  }
  
  // Start editing a time
  function startEdit(time: string) {
    editingTime = { original: time, value: time };
    deleteConfirmation = null; // Sai do modo de confirmação se estiver ativo
  }
  
  // Cancel editing
  function cancelEdit() {
    editingTime = null;
  }
  
  // Save edited time
  function saveEdit() {
    if (!editingTime) return;
    
    // Only make changes if the value actually changed
    if (editingTime.original !== editingTime.value) {
      if (!notificationTimes.includes(editingTime.value)) {
        // Remove the old time
        userSessionStore.removeNotificationTime(editingTime.original);
        
        // Add the new time
        userSessionStore.addNotificationTime(editingTime.value);
        
        // Check if we should send a notification now
        checkCurrentTime();
      }
    }
    
    // Clear editing state
    editingTime = null;
  }
  
  // Remove a notification time
  function removeTime(time: string) {
    console.log('Removing time:', time);
    userSessionStore.removeNotificationTime(time);
    deleteConfirmation = null; // Reset confirmation
  }
  
  // Start confirmation process
  function startDeleteConfirmation(time: string) {
    deleteConfirmation = time;
    editingTime = null; // Sai do modo de edição se estiver ativo
  }
  
  // Cancel delete confirmation
  function cancelDelete() {
    deleteConfirmation = null;
  }
  
  // Format time for display
  function formatTime(time: string): string {
    try {
      // Parse time in 24h format (HH:MM)
      const [hours, minutes] = time.split(':').map(Number);
      
      // Create a date object to use built-in formatting
      const date = new Date();
      date.setHours(hours, minutes, 0);
      
      // Format in user's locale
      return date.toLocaleTimeString(navigator.language, { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true // Use 12h format with AM/PM
      });
    } catch (e) {
      console.error('Error formatting time:', e);
      return time; // Return original if formatting fails
    }
  }
  
  // Get the current time in HH:MM format for the input's default value
  function getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
</script>

<div class="card p-4 mb-4">
  <header class="card-header">
    <h2 class="h3">{$_('settings.notifications')}</h2>
  </header>
  
  <section class="p-4">
    {#if permissionStatus === 'unsupported'}
      <div class="alert variant-filled-warning">
        {$_('settings.notificationsUnsupported')}
      </div>
    {:else if permissionStatus === 'default'}
      <div class="alert variant-filled-primary mb-4">
        <p>{$_('settings.notificationsPermission')}</p>
        <button class="btn variant-filled-surface mt-2" on:click={requestPermission}>
          {$_('settings.enableNotifications')}
        </button>
      </div>
    {:else if permissionStatus === 'denied'}
      <div class="alert variant-filled-warning mb-4">
        <p>{$_('settings.notificationsDenied')}</p>
      </div>
    {:else}
      <div class="notification-status">
        {#if status.error}
          <div class="alert variant-filled-warning">
            <p>Erro: {status.error}</p>
          </div>
        {/if}
        
        <div class="flex flex-col sm:flex-row gap-2 mb-2">
          <button class="btn variant-filled-success" on:click={testNotification}>
            Enviar Notificação de Teste
          </button>
          
          <button class="btn variant-filled-primary" on:click={forceCheckNotifications}>
            Verificar Notificações Agora
          </button>
          
          <button class="btn variant-filled-surface" on:click={checkServiceWorkerStatus}>
            Verificar Status do Sistema
          </button>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-2">
          {#if status.swRegistered}
            <div class="text-success-500">
              <span>✓ Service Worker registrado</span>
            </div>
          {:else}
            <div class="text-error-500">
              <span>✗ Service Worker não registrado</span>
            </div>
          {/if}
          
          {#if status.lastChecked}
            <div class="opacity-70">
              <span>Última verificação: {status.lastChecked}</span>
            </div>
          {/if}
          
          {#if status.lastSent}
            <div class="text-success-500">
              <span>Última notificação enviada: {status.lastSent}</span>
            </div>
          {/if}
        </div>
        
        {#if debugInfo}
          <div class="mt-2 p-2 bg-surface-100-800-token rounded-container-token">
            <button class="text-sm underline" 
              on:click={() => { navigator.clipboard.writeText(debugInfo); }}>
              Copiar informações de diagnóstico
            </button>
            <pre class="text-xs mt-1 opacity-70 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        {/if}
      </div>

      <div class="mb-4 mt-4">
        <label class="label">
          <span>{$_('settings.addNotificationTime')}</span>
          <div class="flex gap-2">
            <input 
              type="time" 
              bind:value={newTime} 
              class="input"
              placeholder={getCurrentTime()}
            />
            <button class="btn variant-filled-primary" on:click={addTime}>
              {$_('common.add')}
            </button>
          </div>
        </label>
        <div class="mt-2">
          <button 
            class="btn btn-sm variant-soft-primary" 
            on:click={() => { newTime = getCurrentTime(); }}
          >
            {$_('settings.useCurrentTime')}
          </button>
        </div>
      </div>
      
      <div class="mt-4">
        {#if notificationTimes.length === 0}
          <p class="text-sm opacity-70">{$_('settings.noNotificationsSet')}</p>
        {:else}
          <h3 class="h4 mb-2">{$_('settings.scheduledTimes')}</h3>
          <ul class="list">
            {#each notificationTimes as time}
              <li class="notification-item">
                {#if editingTime && editingTime.original === time}
                  <!-- Modo de edição -->
                  <div class="flex gap-2 items-center flex-grow">
                    <input 
                      type="time" 
                      bind:value={editingTime.value} 
                      class="input input-sm"
                    />
                    <div class="flex gap-1">
                      <button 
                        class="btn btn-sm variant-filled-success" 
                        on:click={saveEdit}
                        title={$_('common.save')}
                      >
                        ✓
                      </button>
                      <button 
                        class="btn btn-sm variant-filled-error" 
                        on:click={cancelEdit}
                        title={$_('common.cancel')}
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                
                {:else if deleteConfirmation === time}
                  <!-- Modo de confirmação de exclusão -->
                  <div class="flex gap-2 items-center justify-between w-full">
                    <span class="text-error-500">{$_('settings.confirmDeleteQuestion')}</span>
                    <div class="flex gap-1">
                      <button 
                        class="btn btn-sm variant-filled-error" 
                        on:click={() => removeTime(time)}
                      >
                        {$_('common.yes')}
                      </button>
                      <button 
                        class="btn btn-sm variant-filled" 
                        on:click={cancelDelete}
                      >
                        {$_('common.no')}
                      </button>
                    </div>
                  </div>
                  
                {:else}
                  <!-- Modo de visualização -->
                  <span class="flex-grow">{formatTime(time)}</span>
                  <div class="flex gap-2">
                    <button 
                      class="btn btn-sm variant-soft-primary" 
                      on:click={() => startEdit(time)}
                    >
                      {$_('common.edit')}
                    </button>
                    <button 
                      class="btn btn-sm variant-soft-error" 
                      on:click={() => startDeleteConfirmation(time)}
                    >
                      {$_('common.delete')}
                    </button>
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
    
    <div class="text-sm mt-4 opacity-70">
      <p>{$_('settings.notificationsInfo')}</p>
    </div>
  </section>
</div>

<style>
  .list {
    margin-bottom: 1rem;
  }
  
  .notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-surface-300);
    border-radius: 0.25rem;
  }
  
  .notification-item:hover {
    background-color: rgba(var(--color-surface-500-rgb), 0.1);
  }
  
  .notification-status {
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: 0.25rem;
    background-color: rgba(var(--color-surface-500-rgb), 0.05);
  }
</style>