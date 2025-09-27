import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from './api/api.js';

const firebaseConfig = {
    apiKey: "AIzaSyDxvV3B1fkH5hvZm29PuZ3-jWuV9bInTqw",
    authDomain: "adarsh-dham.firebaseapp.com",
    projectId: "adarsh-dham",
    storageBucket: "adarsh-dham.firebasestorage.app",
    messagingSenderId: "464835859595",
    appId: "1:464835859595:web:638eeb9f9d491a54e6f08e",
    measurementId: "G-N2S8LH9YGT"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const currentToken = await getToken(messaging, {
        vapidKey: 'DVgyw01N-Y6HIlUp7CKY4-uB6AyXU2gn36d5A0-gk3c',
      });

      if (currentToken) {
        console.log('FCM Token:', currentToken);
        await api.post('/users/save-fcm-token', { token: currentToken });
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received. ', payload);
      resolve(payload);
    });
  });