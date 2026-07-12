import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});


export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}


export async function scheduleWeekendReminders() {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return false;

  
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Weekend Movie Time! 🍿",
      body: "It's the weekend! Grab some popcorn and check out your Watchlist for some great movies to watch.",
    },
    trigger: {
      weekday: 7, 
      hour: 10,   
      minute: 0,
      repeats: true, 
    } as any, 
  });
  
  return true;
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}