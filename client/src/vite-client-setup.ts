
// Custom Vite client setup to fix WebSocket connections in Replit
import { HMRPayload, SocketOptions } from 'vite/types/hmr';

// Get the Replit domain from the current URL
const replitDomain = window.location.hostname;
const port = window.location.port ? parseInt(window.location.port) : 443;

// Override the default WebSocket connection to use the Replit domain
if (import.meta.hot) {
  const socketProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const socketHost = replitDomain;
  const socketUrl = `${socketProtocol}://${socketHost}${port !== 80 && port !== 443 ? `:${port}` : ''}`;
  
  // Force Vite's HMR to use our custom WebSocket URL
  const originalWebSocket = window.WebSocket;
  
  window.WebSocket = function(url: string, protocols?: string | string[]) {
    // Only intercept Vite HMR connections
    if (url.includes('vite')) {
      // Replace localhost with the Replit domain
      const fixedUrl = url.replace(/wss?:\/\/localhost:[^\/]+/, socketUrl);
      console.log(`[vite-client] Redirecting WebSocket connection to ${fixedUrl}`);
      return new originalWebSocket(fixedUrl, protocols);
    }
    
    // Let other WebSocket connections go through unchanged
    return new originalWebSocket(url, protocols);
  } as any;
  
  console.log(`[vite-client] Custom WebSocket setup complete for ${socketUrl}`);
}

export default {};
