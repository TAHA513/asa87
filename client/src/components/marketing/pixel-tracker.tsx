import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";

interface PixelConfig {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  snapchat?: string;
}

declare global {
  interface Window {
    fbq: any;
    twq: any;
    _linkedin_data_partner_ids: any;
    ttq: any;
    snaptr: any;
  }
}

export function PixelTracker() {
  const { data: apiKeys } = useQuery({
    queryKey: ["/api/settings/api-keys"],
  });

  useEffect(() => {
    if (!apiKeys) return;

    // Initialize Facebook Pixel
    if (apiKeys.facebook?.pixelId) {
      window.fbq = window.fbq || function() {
        (window.fbq.q = window.fbq.q || []).push(arguments);
      };
      window.fbq.l = +new Date();
      window.fbq('init', apiKeys.facebook.pixelId);
      window.fbq('track', 'PageView');
    }

    // Initialize Twitter Pixel
    if (apiKeys.twitter?.pixelId) {
      window.twq = window.twq || function() {
        (window.twq.q = window.twq.q || []).push(arguments);
      };
      window.twq('init', apiKeys.twitter.pixelId);
      window.twq('track', 'PageView');
    }

    // Initialize LinkedIn Insight Tag
    if (apiKeys.linkedin?.pixelId) {
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(apiKeys.linkedin.pixelId);

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
      document.body.appendChild(script);
    }

    // Initialize TikTok Pixel
    if (apiKeys.tiktok?.pixelId) {
      window.ttq = window.ttq || {
        methods: ["ready", "load", "track", "page", "identify", "group"],
        values: [],
        q: [],
        ready: function(f) {
          if (ttq.methods.indexOf("ready") > -1) {
            f.call(this);
          }
        }
      };

      window.ttq.load(apiKeys.tiktok.pixelId);
      window.ttq.page();
    }

    // Initialize Snapchat Pixel
    if (apiKeys.snapchat?.pixelId) {
      window.snaptr = function() {
        window.snaptr.handleRequest 
          ? window.snaptr.handleRequest.apply(window.snaptr, arguments)
          : window.snaptr.queue.push(arguments);
      };
      window.snaptr.queue = [];
      window.snaptr('init', apiKeys.snapchat.pixelId);
      window.snaptr('track', 'PAGE_VIEW');
    }

    // Cleanup function
    return () => {
      // Remove LinkedIn script if it exists
      const linkedInScript = document.querySelector('script[src*="snap.licdn.com"]');
      if (linkedInScript) {
        linkedInScript.remove();
      }
    };
  }, [apiKeys]);

  return null;
}