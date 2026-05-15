
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          console.log('✅ SW registered: ', registration);
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            console.log('🔄 Service Worker update found');
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('📱 New content available; please refresh.');
                  window.dispatchEvent(new CustomEvent('sw-update-available'));
                } else {
                  console.log('📦 Content is cached for offline use.');
                  window.dispatchEvent(new CustomEvent('sw-cached'));
                }
              }
            });
          });
        })
        .catch(error => {
          console.log('❌ SW registration failed: ', error);
        });
      navigator.serviceWorker.ready.then(registration => {
        console.log('🎯 Service Worker ready');
      });
    });
  } else {
    console.log('⚠️ Service Worker not supported');
  }
}
export function checkForUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
}
export function forceUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.update();
      }
    });
  }
}
export async function getSWStatus() {
  if (!('serviceWorker' in navigator)) {
    return { supported: false, active: false, offline: false };
  }
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const hasActive = registrations.length > 0;
    return {
      supported: true,
      active: hasActive,
      offline: hasActive && navigator.onLine === false,
      registrations: registrations.length
    };
  } catch (error) {
    console.error('Error getting SW status:', error);
    return { supported: true, active: false, offline: false, error: error.message };
  }
}
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
        console.log('🔴 Service Worker unregistered');
      })
      .catch(error => {
        console.error('Error unregistering SW:', error.message);
      });
  }
}