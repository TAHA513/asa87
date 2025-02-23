import { useEffect, useRef, useState } from 'react';

interface AnalyticsData {
  platform: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  timestamp: number;
}

export function useAnalyticsSocket() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        setData(newData);
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return data;
}