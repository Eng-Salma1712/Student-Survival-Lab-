import { useState, useEffect } from 'react';

const VAPID_PUBLIC_KEY = 'BEIRxlqKPY9knJhapK9soSetiPPd6V6OnJXjsY200Yu9ZmxUq58rWEQNuJEmXQXS3A9y41_qTR3B5CVkOToIGAs';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          return registration.pushManager.getSubscription();
        })
        .then((subscription) => {
          setIsSubscribed(!!subscription);
        })
        .catch((err) => {
          // Graceful handling for iframe or preview environments
          console.debug('Service Worker / PushManager registration status:', err?.message || err);
        });
    }
  }, []);

  const subscribeUser = async (): Promise<{ success: boolean; status: NotificationPermission | 'unsupported' }> => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return { success: false, status: 'unsupported' };
      }

      let permissionResult = Notification.permission;
      if (permissionResult !== 'granted') {
        permissionResult = await Notification.requestPermission();
        setPermission(permissionResult);
      }

      if (permissionResult !== 'granted') {
        return { success: false, status: permissionResult };
      }

      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.pushManager) {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            if (subscription) {
              await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription),
              }).catch(() => {});
            }
          }
        } catch (swErr) {
          console.debug('Push registration note:', swErr);
        }
      }

      setIsSubscribed(true);
      return { success: true, status: 'granted' };
    } catch (error) {
      console.debug('Push notification status:', error);
      return { success: false, status: 'denied' };
    }
  };

  return { isSubscribed, subscribeUser, permission };
}

