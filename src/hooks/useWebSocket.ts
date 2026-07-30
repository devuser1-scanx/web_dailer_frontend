// src/hooks/useWebSocket.ts

import { useEffect, useRef, useState } from "react";

const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL || "ws://localhost:5000";

export type WebSocketEvent = {
  type: string;
  payload?: any;
  message?: string;
  meta?: any;
};

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<WebSocketEvent[]>([]);

  useEffect(() => {
    const wsUrl = `${WS_BASE_URL}/ws/calls?client_id=frontend_dashboard&clinic_id=1`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      ws.send("ping");
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        console.log("WebSocket event:", parsed);

        setEvents((prev) => [parsed, ...prev].slice(0, 50));
      } catch (error) {
        console.error("Invalid WebSocket message:", event.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 25000);

    return () => {
      clearInterval(heartbeat);
      ws.close();
    };
  }, []);

  return {
    connected,
    events,
  };
}