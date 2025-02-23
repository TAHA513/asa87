import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function useAnalyticsSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // فقط إنشاء اتصال WebSocket إذا كان المستخدم مسجل الدخول
    if (!user) return;

    // إنشاء اتصال WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/analytics`;

    try {
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connection established');
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // تحديث البيانات في الكاش
          queryClient.setQueryData(['/api/marketing/analytics'], (oldData: any) => ({
            ...oldData,
            platforms: data.platforms || oldData?.platforms,
            timeSeries: data.timeSeries || oldData?.timeSeries,
          }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "خطأ في الاتصال",
          description: "فشل في الاتصال بخدمة التحليلات المباشرة",
          variant: "destructive",
        });
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [queryClient, user, toast]);

  return socketRef.current;
}