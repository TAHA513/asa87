import { useState, useEffect } from "react";
import { AlertTriangle, Info } from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  date: Date;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Count unread notifications
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  function markAllAsRead() {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }

  function markAsRead(id: string) {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }

  return (
    <div className="relative">
      {/* Notification button with badge */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification panel */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-md shadow-lg overflow-hidden z-50 border dark:border-gray-700">
          <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium">الإشعارات</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                تعيين الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                لا توجد إشعارات
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {notification.type === 'warning' && <AlertTriangle className="text-yellow-500" size={18} />}
                      {notification.type === 'error' && <AlertTriangle className="text-red-500" size={18} />}
                      {notification.type === 'info' && <Info className="text-blue-500" size={18} />}
                      {notification.type === 'success' && (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 mr-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(notification.date).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t dark:border-gray-700 text-center">
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                عرض كل الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}