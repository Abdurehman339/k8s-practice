export interface TNotificationPayload {
  tokens?: string[];
  title: string;
  message: string;
  sender: string;
  receivers: string[];
  type: string;
  context?: string | Array<string> | Record<string, string> | object;
}
