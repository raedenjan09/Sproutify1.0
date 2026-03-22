// backend/utils/pushNotification.js
let expoModulePromise;
let expoClientPromise;

const getExpoModule = async () => {
  expoModulePromise = expoModulePromise || import('expo-server-sdk');
  return expoModulePromise;
};

const getExpoClient = async () => {
  if (!expoClientPromise) {
    expoClientPromise = getExpoModule().then(({ Expo }) => new Expo());
  }

  return expoClientPromise;
};

/**
 * Send push notification to a single device
 * @param {string} pushToken - Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data to send
 * @returns {Promise} - Promise that resolves when notification is sent
 */
exports.sendPushNotification = async (pushToken, title, body, data = {}) => {
  try {
    const { Expo } = await getExpoModule();
    const expo = await getExpoClient();

    console.log('Preparing push notification...');
    console.log('Token:', pushToken ? pushToken.substring(0, 20) + '...' : 'none');
    console.log('Title:', title);
    console.log('Body:', body);

    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Invalid Expo push token: ${pushToken}`);
      throw new Error(`Invalid Expo push token: ${pushToken}`);
    }

    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'order-updates',
    };

    console.log('Sending push message:', JSON.stringify(message, null, 2));

    const ticket = await expo.sendPushNotificationsAsync([message]);

    console.log('Push notification ticket:', JSON.stringify(ticket, null, 2));

    if (ticket[0].status === 'error') {
      console.error('Push notification error:', ticket[0].message);
      throw new Error(ticket[0].message);
    }

    return ticket;
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    throw error;
  }
};

/**
 * Send push notifications to multiple devices
 * @param {Array} messages - Array of message objects
 * @returns {Promise} - Promise that resolves when all notifications are sent
 */
exports.sendMultiplePushNotifications = async (messages) => {
  try {
    const { Expo } = await getExpoModule();
    const expo = await getExpoClient();

    const validMessages = messages.filter((msg) => Expo.isExpoPushToken(msg.to));

    if (validMessages.length === 0) {
      console.log('No valid push tokens found');
      return [];
    }

    const chunks = expo.chunkPushNotifications(validMessages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending chunk:', error);
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error sending multiple push notifications:', error);
    throw error;
  }
};
