import { registerSW } from 'virtual:pwa-register';

export function setupPWA() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('🔄 New Zen Security SaaS update available.');
      },
      onOfflineReady() {
        console.log('🛡️ Zen Security SaaS is offline-ready for security officers.');
      },
    });
  }
}
