import { useEffect, useRef, useState } from "react";
import {
  useNotifications,
  useSetUnreadCount,
  useReadUnreadCount,
  useSetUploadProgress,
} from "@/store/notifications";

export function useNotificationsButton() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useNotifications();
  const setUnreadCount = useSetUnreadCount();
  const unreadCount = useReadUnreadCount();
  const setUploadProgress = useSetUploadProgress();
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `${window.location.protocol}//${window.location.hostname}:8080/notifications/employee`;
    const source = new EventSource(url, { withCredentials: true });
    sourceRef.current = source;

    const handleEvent = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const item = {
          event: e.type || payload.event || "message",
          data: payload,
          receivedAt: new Date().toISOString(),
        };

        if (e.type === "bulk-create-employee-progress") {
          setUploadProgress(payload);
        }

        // Store notification in list
        setNotifications((prev) => [item, ...prev].slice(0, 10));
        setUnreadCount((prev) => prev + 1);
      } catch (err) {
        console.error("Failed to parse SSE message", err);
      }
    };

    source.addEventListener("create-employee", handleEvent as EventListener);
    source.addEventListener(
      "bulk-create-employee-progress",
      handleEvent as EventListener
    );

    source.onerror = (err) => {
      console.warn("SSE connection error:", err);
    };

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [setNotifications, setUnreadCount, setUploadProgress]);

  useEffect(() => {
    if (!open) return;
    setUnreadCount(0);
  }, [open, setUnreadCount]);

  return {
    open,
    setOpen,
    unreadCount,
    notifications,
    setUnreadCount,
  };
}
