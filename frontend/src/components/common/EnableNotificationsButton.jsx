import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { FaBell, FaBellSlash, FaSpinner } from 'react-icons/fa';

// Your VAPID Public Key
const VAPID_PUBLIC_KEY = "BBtSN3ZjmBjiT-jODQkhdTKl2Sb9F-4F13B1ibE2ENbRIm6_UPgF8r-X-pUN7Hs_F2Bg_cGdCm4pDDmcgktH_Jg";

// This helper function converts the VAPID key string into the format the browser needs.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const EnableNotificationsButton = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error("Error checking subscription:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkSubscription();
  }, []);

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      alert('Push notifications are not supported by your browser.');
      return;
    }
      
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        // Remove subscription from your server as well
        await api.delete('/notifications/unsubscribe', { data: { endpoint: existingSubscription.endpoint } });
        setIsSubscribed(false);
      } else {
        // Here's the key part: The browser prompt is triggered by this `subscribe` call.
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        });
        
        await api.post('/notifications/subscribe', subscription);
        setIsSubscribed(true);
      }
    } catch (error) {
      if (Notification.permission === 'denied') {
        alert('You have blocked notifications. Please enable them in your browser settings.');
      } else {
        console.error('Failed to subscribe:', error);
        alert('An error occurred while trying to subscribe to notifications.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (!('PushManager' in window)) {
    return null;
  }

  return (
    <button 
      onClick={handleSubscribe} 
      disabled={loading} 
      className={`flex items-center justify-center w-full sm:w-auto px-4 py-2 text-base font-medium rounded-md transition-colors disabled:opacity-50 ` +
        (isSubscribed 
            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
            : 'bg-green-100 text-green-700 hover:bg-green-200')
      }
    >
      {loading ? <FaSpinner className="animate-spin" /> : (isSubscribed ? <FaBellSlash className="mr-2" /> : <FaBell className="mr-2" />)}
      <span>
        {loading ? 'Loading...' : (isSubscribed ? 'Disable Notifications' : 'Enable Notifications')}
      </span>
    </button>
  );
};

export default EnableNotificationsButton;