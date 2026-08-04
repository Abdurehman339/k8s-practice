import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { IFirebaseService } from '../interface/firebase';
import { AppConfig } from 'src/config';
import { TPushMessage, TPushMultipleMessage } from '../types';

@Injectable()
export class FireabaseService implements IFirebaseService {
  private instance: admin.app.App;

  constructor() {
    this.instance = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: AppConfig.firebase.project_id,
        clientEmail: AppConfig.firebase.client_email,
        privateKey: AppConfig.firebase.private_key,
      }),
    });
  }

  private payload(message: TPushMessage, token: string) {
    const payload: admin.messaging.TokenMessage = {
      notification: {
        title: message.title,
        body: message.message,
      },
      android: {
        priority: 'normal',
        collapseKey: message.collapse_key,
      },
      fcmOptions: {
        analyticsLabel: `${message.title}.${token}`,
      },
      data: message?.data || {},
      token: token,
    };

    return payload;
  }

  private multi_payload(message: TPushMessage, tokens: string[]) {
    const payload: admin.messaging.MulticastMessage = {
      notification: {
        title: message.title,
        body: message.message,
      },
      android: {
        priority: 'normal',
        collapseKey: message.collapse_key,
      },
      fcmOptions: {
        analyticsLabel: `${message.title}.${tokens.join(',')}`,
      },
      data: message?.data || {},
      tokens: tokens,
    };

    return payload;
  }

  private async subscribe(tokens: string[] | string, topic: string) {
    const templateTopic = `notification-${topic}-${uuid()}`;
    try {
      return await this.instance
        .messaging()
        .subscribeToTopic(tokens, templateTopic);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  }

  private async unsubscribe(tokens: string[] | string, topic: string) {
    const templateTopic = `notification-${topic}-${uuid()}`;
    try {
      return await this.instance
        .messaging()
        .unsubscribeFromTopic(tokens, templateTopic);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }

  async push_multiple(tokens: string[], message: TPushMultipleMessage) {
    await this.subscribe(tokens, message.topic);
    const payload = this.multi_payload(message, tokens);

    try {
      const notificationSend = await this.instance
        .messaging()
        .sendEachForMulticast(payload);
      console.log('notificationSend ==>', notificationSend);

      if (notificationSend.failureCount > 0) {
        notificationSend.responses.forEach((response: any, i: number) => {
          if (!response.success) {
            console.error(
              `Failed to send message to ${tokens[i]}: ${response.error?.message}`,
            );
          }
        });
      }
      return notificationSend;
    } catch (error) {
      this.handle_errors(error);
      await this.unsubscribe(tokens, message.topic);
    }
  }

  async push(token: string | null, message: TPushMultipleMessage) {
    await this.subscribe(token, message.topic);
    const payload = this.payload(message, token);
    try {
      const notificationSend = await this.instance.messaging().send(payload);
      return notificationSend;
    } catch (error) {
      this.handle_errors(error);
      await this.unsubscribe(token, message.topic);
    }
  }

  private handle_errors(error: { code: string; message: string }) {
    if (error.code === 'messaging/invalid-registration-token') {
      console.error('Invalid FCM token:', error.message);
    } else if (error.code === 'messaging/registration-token-not-registered') {
      console.error('FCM token not registered:', error.message);
    } else {
      console.error('Error sending FCM notification:', error);
    }
  }
}
