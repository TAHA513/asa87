
import { useState, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { io, Socket } from "socket.io-client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { arEG } from "date-fns/locale";

// أنواع الإشعارات المختلفة
type NotificationType = 
  | "inventory_alert" 
  | "inventory_check_complete"
  | "upcoming_appointments"
  | "installment_due"
  | "system_update";

import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { AlertTriangle, Info } from "lucide-react";

interface Notification {
  id: string;
  type: NotificationType;
  data: any;
  timestamp: Date;
  read: boolean;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // إنشاء اتصال بالسوكت عند تحميل المكوّن
  useEffect(() => {
    if (user) {
      console.log("إنشاء اتصال Socket.IO للإشعارات للمستخدم:", user.id);
      
      // استخدام البداية النسبية للمسار
      const socketInstance = io("/", {
        withCredentials: true,
      });

      socketInstance.on("connect", () => {
        console.log("تم الاتصال بالسوكت");
        // تسجيل المستخدم للحصول على إشعارات شخصية
        socketInstance.emit("register", user.id);
      });

      socketInstance.on("notification", (notification) => {
        console.log("تم استلام إشعار جديد:", notification);
        const newNotification = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: notification.type as NotificationType,
          data: notification.data,
          timestamp: new Date(notification.timestamp),
          read: false,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      socketInstance.on("disconnect", () => {
        console.log("تم قطع الاتصال بالسوكت");
      });

      setSocket(socketInstance);

      // تنظيف
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user]);

  // تحديث عدد الإشعارات غير المقروءة
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "inventory_alert":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "upcoming_appointments":
        return <Info className="h-5 w-5 text-info" />;
      case "installment_due":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "system_update":
        return <Info className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getNotificationContent = (notification: Notification) => {
    const { type, data } = notification;
    
    switch (type) {
      case "inventory_alert":
        return (
          <div>
            <h4 className="font-semibold">تنبيه المخزون</h4>
            <p className="text-sm">
              المنتج "{data.productName}" منخفض في المخزون ({data.currentStock})
            </p>
          </div>
        );
      case "upcoming_appointments":
        return (
          <div>
            <h4 className="font-semibold">مواعيد قادمة</h4>
            <p className="text-sm">
              لديك {data.count} مواعيد قادمة في الـ 24 ساعة القادمة
            </p>
          </div>
        );
      case "inventory_check_complete":
        return (
          <div>
            <h4 className="font-semibold">فحص المخزون</h4>
            <p className="text-sm">{data.message}</p>
          </div>
        );
      default:
        return (
          <div>
            <h4 className="font-semibold">إشعار</h4>
            <p className="text-sm">إشعار جديد من النظام</p>
          </div>
        );
    }
  };

  // للتجربة، قم بإضافة إشعار تجريبي بعد تحميل المكون
  useEffect(() => {
    if (notifications.length === 0) {
      setTimeout(() => {
        const testNotification = {
          id: `test-${Date.now()}`,
          type: "system_update" as NotificationType,
          data: { message: "مرحباً بك في نظام الإشعارات الجديد" },
          timestamp: new Date(),
          read: false,
        };
        setNotifications([testNotification]);
      }, 3000);
    }
  }, []);

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">الإشعارات</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={markAllAsRead}
              title="تعليم الكل كمقروء"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearAll}
              title="حذف الكل"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              لا توجد إشعارات
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "border-b p-3 hover:bg-muted/50 transition-colors flex items-start gap-3",
                  !notification.read && "bg-muted/20"
                )}
              >
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  {getNotificationContent(notification)}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.timestamp, {
                      addSuffix: true,
                      locale: arEG,
                    })}
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => markAsRead(notification.id)}
                    title="تعليم كمقروء"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
