const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); 

try {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
}

const messaging = firebaseAdmin.messaging();

/**
 * Sends a push notification to a list of FCM tokens.
 * @param {string[]} tokens - An array of FCM registration tokens.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body/message of the notification.
 * @param {object} [data] - Optional data payload to send with the notification.
 */
const sendFcmNotification = async (tokens, title, body, data) => {
  if (!tokens || tokens.length === 0) {
    console.log('No FCM tokens provided. Skipping push notification.');
    return;
  }

  const message = {
    notification: {
      title: title,
      body: body
    },
    data: data || {},
    tokens: tokens,
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    console.log('Successfully sent FCM messages:', response);
  } catch (error) {
    console.error('Error sending FCM messages:', error);
  }
};

module.exports = { sendFcmNotification };