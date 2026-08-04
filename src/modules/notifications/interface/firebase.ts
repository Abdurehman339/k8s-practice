import {
  BatchResponse,
  // MessagingTopicManagementResponse,
  // MulticastMessage,
  // TokenMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import { TPushMessage, TPushMultipleMessage } from '../types';

export interface IFirebaseService {
  // payload(message: TPushMessage, token: string): TokenMessage;
  // multi_payload(message: TPushMessage, tokens: string[]): MulticastMessage;
  // subscribe(
  //   tokens: string[] | string,
  //   topic: string,
  // ): Promise<MessagingTopicManagementResponse>;
  // unsubscribe(
  //   tokens: string[] | string,
  //   topic: string,
  // ): Promise<MessagingTopicManagementResponse>;
  push_multiple(
    tokens: string[],
    message: TPushMultipleMessage,
  ): Promise<BatchResponse>;
  push(token: string | null, message: TPushMultipleMessage): Promise<string>;
  // handle_errors(error: { code: string; message: string }): void;
}
