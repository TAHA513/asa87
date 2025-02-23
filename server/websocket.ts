import { WebSocketServer } from 'ws';
import type { Server } from 'http';

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    // إرسال بيانات تجريبية كل 5 ثواني
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        const platforms = ['facebook', 'instagram', 'twitter', 'tiktok', 'snapchat', 'linkedin'];

        // إنشاء بيانات واقعية لكل منصة
        const mockData = platforms.map(platform => ({
          platform,
          impressions: Math.floor(Math.random() * (platform === 'facebook' || platform === 'instagram' ? 10000 : 5000)),
          clicks: Math.floor(Math.random() * (platform === 'facebook' || platform === 'instagram' ? 1000 : 500)),
          conversions: Math.floor(Math.random() * (platform === 'facebook' || platform === 'instagram' ? 100 : 50)),
          spend: Math.floor(Math.random() * (platform === 'facebook' || platform === 'instagram' ? 1000 : 500)),
          timestamp: Date.now()
        }));

        ws.send(JSON.stringify(mockData));
      }
    }, 5000);

    ws.on('close', () => {
      clearInterval(interval);
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(interval);
    });
  });

  return wss;
}