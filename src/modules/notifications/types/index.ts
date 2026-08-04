import { ENotificationType } from '@prisma/client';

export interface TNotificationPayload {
  notification_id?: string;
  title?: string;
  message?: string;
  type: ENotificationType;
  sender_id: string;
  reciever_ids: string | string[];
  fcm?: string;
  info?: any;
  appointment_id?: string;
  review_id?: string;
  chat_id?: string;
  favourite_id?: string;
}

interface TPushNotification {
  fcm: string;
  topic: string;
  title: string;
  message: string;
  context: any;
}

export interface TPushMessage {
  title: string;
  message: string;
  context?: string;
  data?: any;
  collapse_key?: string;
}

export interface TPushMultipleMessage extends TPushMessage {
  topic?: string;
}
