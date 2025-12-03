import { atom, useAtom, useSetAtom, useAtomValue } from "jotai";

export type Notification = {
  event: string;
  data: any;
  receivedAt: string;
};

export type UploadProgress = {
  jobId?: string;
  status?: "PROCESSING" | "COMPLETED" | "FAILED";
  progress?: number; // 0-100
  message?: string;
  importedCount?: number;
  failedCount?: number;
  errors?: Array<{ row: number; message: string }>;
} | null;

// Atom for storing all notifications
export const notificationsAtom = atom<Notification[]>([]);

// Atom for storing unread count
export const unreadCountAtom = atom(0);

// Atom for storing current upload progress
export const uploadProgressAtom = atom<UploadProgress>(null);

// Convenient hooks
export function useNotifications() {
  return useAtom(notificationsAtom);
}

export function useSetNotifications() {
  return useSetAtom(notificationsAtom);
}

export function useReadNotifications() {
  return useAtomValue(notificationsAtom);
}

export function useUnreadCount() {
  return useAtom(unreadCountAtom);
}

export function useSetUnreadCount() {
  return useSetAtom(unreadCountAtom);
}

export function useReadUnreadCount() {
  return useAtomValue(unreadCountAtom);
}

export function useUploadProgress() {
  return useAtom(uploadProgressAtom);
}

export function useSetUploadProgress() {
  return useSetAtom(uploadProgressAtom);
}

export function useReadUploadProgress() {
  return useAtomValue(uploadProgressAtom);
}
