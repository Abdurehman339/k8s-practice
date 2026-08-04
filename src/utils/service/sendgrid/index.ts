import { Injectable, OnModuleInit } from '@nestjs/common';
import { EOTP } from '@prisma/client';
import { AttachmentJSON } from '@sendgrid/helpers/classes/attachment';
import {
  ASMOptionsJSON,
  MailContent,
  MailSettingsJSON,
  TrackingSettingsJSON,
} from '@sendgrid/helpers/classes/mail';
import { PersonalizationJSON } from '@sendgrid/helpers/classes/personalization';
import * as sgMail from '@sendgrid/mail';
import { AppConfig } from 'src/config';

interface sendEmailPropType {
  to: string;
  subject: string;
  type: EOTP;
  code?: string;
  name?: string;
  text?: string;

  categories?: string[];
  headers?: { [key: string]: string };
  replyTo?: string;
  sendAt?: number;
  redirectLink?: string;
  batchId?: string;
  templateId?: string;
  IPPool?: string;
  replyToList?: string[];
  content?: MailContent[];
  personalizations?: PersonalizationJSON[];
  attachments?: AttachmentJSON[];
  settings?: MailSettingsJSON;
  trackingSettings?: TrackingSettingsJSON;
  additional?: { [key: string]: string };
  sections?: { [key: string]: string };
  asm?: ASMOptionsJSON;
}

interface EmailHTMLContentPropType {
  email?: string;
  type?: string;
  text?: string;
  link?: string;
  name?: string;
  code?: string;
}

@Injectable()
export class SendgridEmail implements OnModuleInit {
  onModuleInit() {
    // if (!Config.email.sendgrid.api_key) {
    //   throw new NotFoundException('SendGrid API key not found');
    // }

    // if (!Config.email.sendgrid.client_email) {
    //   throw new NotFoundException('SendGrid sender email not found');
    // }

    sgMail.setApiKey(AppConfig.email.sendgrid.api_key);
  }

  async send({
    text,
    to,
    type,
    subject,
    redirectLink,
    name,
    code,
  }: sendEmailPropType) {
    const capitalizeName = name
      ? name?.charAt(0)?.toUpperCase() + name?.slice(1)
      : '';

    const html =
      type === EOTP.Verify
        ? this.verify_account_html({
            link: redirectLink,
            text,
            email: to,
            name: capitalizeName,
            code,
          })
        : this.forgot_password_html({
            link: redirectLink,
            text,
            email: to,
            name: capitalizeName,
            code,
          });

    const msg: sgMail.MailDataRequired = {
      to,
      from: AppConfig.email.sendgrid.client_email,
      subject,
      html,
    };

    try {
      return await sgMail.send(msg);
    } catch (error) {
      console.error('error sending mail (sendgrid) ===>', {
        code: error.code,
        headers: error.response.headers,
      });

      console.log('body errors ==>', error.response.body.errors);
    }
  }

  private verify_account_html = (props: EmailHTMLContentPropType) => {
    const { email, name, text, link, code } = props;
    return `
    <div style="background-color: #f4f4f7; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;  background-image: url('https://recoplace.com/assets/reco-group-1.png'); background-size: cover;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #1a73e8; padding: 20px 20px; text-align: center;">
          <img src="https://recoplace.com/assets/reco-logo-white.png" alt="Recoplace" width="400" height="90"  style="max-width: 500px;" />
        </div>
  
        <!-- Body -->
        <div style="padding: 20px 20px; color: #333333; text-align: center;">
          <p style="font-size: 16px; line-height: 1.1;">
            Hi <strong>${name}</strong>, Welcome to Recoplace 🎉
          </p>
          <hr />
  
          <p style="font-size: 15px; line-height: 1.6;">
            Thank you for joining Recoplace! We’re thrilled to have you on board. To get started, please verify your email address: <strong>${email}</strong>
          </p>
  
          <p style="font-size: 15px; line-height: 1.6; margin-top: 25px;">🎬 Find the latest and <strong style="color: #1a73e8;">Greatest Movie</strong></p>
          <p style="font-size: 15px; line-height: 1.6;">📚 Discover your next favorite <strong style="color: #1a73e8;">Book</strong></p>
          <p style="font-size: 15px; line-height: 1.6;">🎧 Stay tuned to the best <strong style="color: #1a73e8;">Podcast</strong></p>
          <p style="font-size: 15px; line-height: 1.6;">🍽️ Discover the best places for <strong style="color: #1a73e8;">Dining</strong> near you</p>
          <hr />

          <p style="font-size: 15px; margin-top: 20px;">${text} <b>${code}</b></p>
   
          ${
            link
              ? `<div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #1a73e8; color: #fff; text-decoration: none; padding: 12px 24px; font-size: 16px; border-radius: 5px; display: inline-block;">Verify Email</a>
                <p style="font-size: 12px; color: #777; margin-top: 10px;">If the button doesn't work, copy and paste this link in your browser:<br/>
                <span style="word-break: break-all;">${link}</span></p>
              </div>`
              : ''
          }
        </div>
  
        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 20px; font-size: 12px; text-align: center; color: #777;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Recoplace. All rights reserved.</p>
        </div>
  
      </div>
    </div>
    `;
  };

  private forgot_password_html = (props: EmailHTMLContentPropType) => {
    const { email, name, text, link, code } = props;
    return `
    <div style="background-color: #f4f4f7; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-image: url('https://recoplace.com/assets/reco-group-2.png'); background-size: cover;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #1a73e8; padding: 20px 20px; text-align: center;">
          <img src="https://recoplace.com/assets/reco-logo-white.png" alt="Recoplace" width="400" height="90"  style="max-width: 500px;" />
        </div>
  
        <!-- Body -->
        <div style="padding: 30px 20px; color: #333333; text-align: center;">
          <p style="font-size: 16px; line-height: 1.1;">
            Hi <strong>${name}</strong>,
          </p>
  
          <p style="font-size: 15px; line-height: 1.6;">
            We received a request to reset the password for your account <strong>${email}</strong>.
            If you didn’t make the request, you can safely ignore this email.
          </p>
          <hr />
  
          <p style="font-size: 15px; line-height: 1.6;">
            ${text} <b>${code}</b>
          </p>
    
  
          ${
            link
              ? `<div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #1a73e8; color: #fff; text-decoration: none; padding: 12px 24px; font-size: 16px; border-radius: 5px; display: inline-block;">Reset Password</a>
                <p style="font-size: 12px; color: #777; margin-top: 10px;">If the button doesn't work, copy and paste this link in your browser:<br/>
                <span style="word-break: break-all;">${link}</span></p>
              </div>`
              : ''
          }
        </div>
  
        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 20px; font-size: 12px; text-align: center; color: #777;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Recoplace. All rights reserved.</p>
        </div>
  
      </div>
    </div>
    `;
  };
}
