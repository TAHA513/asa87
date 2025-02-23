import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useAnalyticsSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // إنشاء اتصال WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/analytics`;
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // تحديث البيانات في الكاش
      queryClient.setQueryData(['/api/marketing/analytics'], (oldData: any) => ({
        ...oldData,
        platforms: data.platforms || oldData.platforms,
        timeSeries: data.timeSeries || oldData.timeSeries,
      }));
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [queryClient]);

  return socketRef.current;
}
