"use client";

import { useEffect, useRef, useState } from "react";
import { reconnectDelay, stableConnectionMs } from "../lib/reconnect";

const url = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "").replace(/^http/, "ws");

export function useJobSocket(onMessage: (data: string) => void, onReconnect: () => void): boolean {
  const [connected, setConnected] = useState(false);
  const callbacks = useRef({ onMessage, onReconnect });
  useEffect(() => { callbacks.current = { onMessage, onReconnect }; }, [onMessage, onReconnect]);
  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | null = null;
    let retryTimer: number | null = null;
    let stableTimer: number | null = null;
    let attempt = 0;
    let needsRefresh = false;
    function retry() {
      if (disposed || retryTimer !== null) return;
      retryTimer = window.setTimeout(() => { retryTimer = null; connect(); }, reconnectDelay(attempt++));
    }
    function connect() {
      if (disposed || socket) return;
      let next: WebSocket;
      try { next = new WebSocket(`${url}/api/v1/ws/live`); }
      catch { needsRefresh = true; retry(); return; }
      socket = next;
      next.onopen = () => {
        if (disposed || socket !== next) return;
        setConnected(true);
        stableTimer = window.setTimeout(() => { attempt = 0; stableTimer = null; }, stableConnectionMs);
        if (needsRefresh) { needsRefresh = false; callbacks.current.onReconnect(); }
      };
      next.onmessage = (message) => {
        if (!disposed && socket === next && typeof message.data === "string") callbacks.current.onMessage(message.data);
      };
      next.onerror = () => { if (!disposed && socket === next) next.close(); };
      next.onclose = () => {
        if (socket !== next) return;
        socket = null;
        if (stableTimer !== null) { window.clearTimeout(stableTimer); stableTimer = null; }
        if (disposed) return;
        needsRefresh = true;
        setConnected(false);
        retry();
      };
    }
    connect();
    return () => {
      disposed = true;
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      if (stableTimer !== null) window.clearTimeout(stableTimer);
      const current = socket; socket = null; current?.close();
    };
  }, []);
  return connected;
}
