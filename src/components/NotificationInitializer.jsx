import { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { setNotificationApi } from '../utils/message';

const NotificationInitializer = ({ children }) => {
  const notificationApi = useNotification();

  useEffect(() => {
    setNotificationApi(notificationApi);
  }, [notificationApi]);

  return children;
};

export default NotificationInitializer;