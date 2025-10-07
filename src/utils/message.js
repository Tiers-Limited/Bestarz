import { useNotification } from '../context/NotificationContext';

// Custom message API that mimics Ant Design's message API
let notificationApi = null;

export const setNotificationApi = (api) => {
  notificationApi = api;
};

export const message = {
  success: (content, duration) => {
    if (notificationApi) {
      return notificationApi.success(content, { duration: duration ? duration * 1000 : undefined });
    }
    console.warn('Notification API not initialized');
  },
  
  error: (content, duration) => {
    if (notificationApi) {
      return notificationApi.error(content, { duration: duration ? duration * 1000 : undefined });
    }
    console.warn('Notification API not initialized');
  },
  
  warning: (content, duration) => {
    if (notificationApi) {
      return notificationApi.warning(content, { duration: duration ? duration * 1000 : undefined });
    }
    console.warn('Notification API not initialized');
  },
  
  info: (content, duration) => {
    if (notificationApi) {
      return notificationApi.info(content, { duration: duration ? duration * 1000 : undefined });
    }
    console.warn('Notification API not initialized');
  },
  
  loading: (content, duration) => {
    if (notificationApi) {
      return notificationApi.info(content, { 
        duration: duration ? duration * 1000 : 0, // Loading messages don't auto-dismiss by default
        title: 'Loading...'
      });
    }
    console.warn('Notification API not initialized');
  }
};