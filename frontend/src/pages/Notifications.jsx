import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import { FaBell, FaCheck, FaSpinner } from 'react-icons/fa';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

 const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    console.error('No token found');
    return null;
  }
  return {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
};

  useEffect(() => {
    const fetchNotifications = async () => {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get('/api/notifications', authHeader);
        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    const authHeader = getAuthHeader();
    if (!authHeader) return;

    try {
      await axios.put(`/api/notifications/${notificationId}`, {}, authHeader);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error.response?.data || error.message);
    }
  };

  const markAllAsRead = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader) return;

    try {
      await axios.put('/api/notifications/read-all', {}, authHeader);
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error.response?.data || error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-base-content/70">
            Stay updated with your account activity
          </p>
        </div>
        {notifications.filter((n) => !n.read).length > 0 && (
          <button onClick={markAllAsRead} className="btn btn-outline btn-primary">
            <FaCheck className="mr-2" /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body p-0">
            {notifications.length > 0 ? (
              <div className="divide-y divide-base-300">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-base-300 transition-colors ${
                      !notification.read ? 'bg-base-300/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <FaBell
                            className={`h-5 w-5 ${
                              !notification.read ? 'text-primary' : 'text-base-content/50'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{notification.message}</p>
                          <p className="text-sm text-base-content/70">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="btn btn-xs btn-ghost"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FaBell className="h-12 w-12 text-base-content/30 mb-4" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-base-content/70">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
