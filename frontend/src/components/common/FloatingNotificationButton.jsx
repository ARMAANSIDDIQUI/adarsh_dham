import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaBellSlash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/api';

const VAPID_PUBLIC_KEY = "BBtSN3ZjmBjiT-jODQkhdTKl2Sb9F-4F13B1ibE2ENbRIm6_UPgF8r-X-pUN7Hs_F2Bg_cGdCm4pDDmcgktH_Jg";

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

const FloatingNotificationButton = ({ variants }) => {
    // ✨ FIX: State now has three possibilities: 'loading', 'subscribed', 'unsubscribed'
    const [subscriptionState, setSubscriptionState] = useState('loading');
    const [isActionLoading, setIsActionLoading] = useState(false); // For disabling button during click action

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications not supported.');
            setSubscriptionState('unsupported');
            return;
        }

        const checkSubscription = async () => {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setSubscriptionState(subscription ? 'subscribed' : 'unsubscribed');
            } catch (error) {
                console.error("Error checking initial subscription:", error);
                setSubscriptionState('unsubscribed'); // Default to unsubscribed on error
            }
        };
        checkSubscription();
    }, []);

    const handleSubscribe = async () => {
        setIsActionLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();
            
            console.log("Subscription status on click:", existingSubscription ? "SUBSCRIBED" : "NOT SUBSCRIBED");

            if (existingSubscription) {
                // --- UN-SUBSCRIBE LOGIC ---
                await existingSubscription.unsubscribe();
                await api.delete('/notifications/unsubscribe', { data: { endpoint: existingSubscription.endpoint } });
                setSubscriptionState('unsubscribed');
                toast.info('Notifications disabled.');
            } else {
                // --- SUBSCRIBE LOGIC ---
                if (Notification.permission === 'denied') {
                    toast.warn('You have blocked notifications. Please enable them in browser settings.');
                    setIsActionLoading(false);
                    return;
                }
                const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey,
                });
                await api.post('/notifications/subscribe', subscription);
                setSubscriptionState('subscribed');
                toast.success('Notifications enabled!');
            }
        } catch (error) {
            console.error('Failed to subscribe/unsubscribe:', error);
            toast.error('An error occurred.');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (subscriptionState === 'unsupported') {
        return null;
    }

    const isInitialLoading = subscriptionState === 'loading';
    const isSubscribed = subscriptionState === 'subscribed';
    
    const title = isInitialLoading ? 'Checking...' : (isSubscribed ? "Disable Notifications" : "Enable Notifications");
    const iconColor = isInitialLoading ? "text-gray-500" : (isSubscribed ? "text-red-500" : "text-green-600");
    const hoverColor = isInitialLoading ? "hover:bg-gray-100" : (isSubscribed ? "hover:bg-red-100" : "hover:bg-green-100");

    return (
        <motion.div variants={variants} className="group relative flex items-center">
            <div className="absolute right-16 w-max bg-gray-800 text-white text-xs font-bold rounded-md px-3 py-1.5 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-right">
                {title}
            </div>
            <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubscribe}
                disabled={isInitialLoading || isActionLoading}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors bg-white disabled:opacity-70 ${hoverColor}`}
            >
                {isInitialLoading || isActionLoading
                    ? <FaSpinner size={22} className={`animate-spin ${iconColor}`} />
                    : isSubscribed 
                        ? <FaBellSlash size={22} className={iconColor} /> 
                        : (
                            <motion.div
                                animate={{ rotate: [0, 15, -10, 15, 0] }}
                                transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 10 }}
                            >
                                <FaBell size={22} className={iconColor} />
                            </motion.div>
                        )
                }
            </motion.button>
        </motion.div>
    );
};

export default FloatingNotificationButton;