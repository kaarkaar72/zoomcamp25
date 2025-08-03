import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.expoPushToken = null;
  }

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      this.expoPushToken = token;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  async sendGameNotification(title, body, data = {}) {
    if (!this.expoPushToken) {
      console.log('No push token available');
      return;
    }

    const message = {
      to: this.expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Game-specific notification methods
  async notifyPlayerJoined(playerName, roomCode) {
    await this.sendGameNotification(
      'Player Joined! 🎵',
      `${playerName} joined room ${roomCode}`,
      { type: 'player_joined', roomCode }
    );
  }

  async notifyGameStarted(roomCode) {
    await this.sendGameNotification(
      'Game Started! 🎮',
      'The music guessing game has begun!',
      { type: 'game_started', roomCode }
    );
  }

  async notifyNewSong(songTitle, songNumber, totalSongs) {
    await this.sendGameNotification(
      'New Song! 🎵',
      `Song ${songNumber}/${totalSongs}: ${songTitle}`,
      { type: 'new_song' }
    );
  }

  async notifyGameFinished(roomCode) {
    await this.sendGameNotification(
      'Game Finished! 🏆',
      'Check out the final scores!',
      { type: 'game_finished', roomCode }
    );
  }

  async scheduleLocalNotification(title, body, seconds = 5) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: { seconds },
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  getExpoPushToken() {
    return this.expoPushToken;
  }
}

export default new NotificationService();