import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { TContactUs } from 'src/modules/user/dto/contact-us';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class HostingerService {
  constructor(private readonly mailService: MailerService) {}

  private compile_html_template(name: string, data: Record<string, any>) {
    const file = readFileSync(
      join(process.cwd(), 'templates', 'email', name),
      'utf8',
    );
    const template = handlebars.compile(file);
    return template(data);
  }

  async send_email(payload: TContactUs): Promise<any> {
    try {
      const {
        first_name,
        last_name,
        email,
        how_we_can_help_you,
        budget,
        message,
        phone,
      } = payload;

      //   const recipients: string[] = [
      //     'techversatile2020@gmail.com',
      //     'jim@appcrops.com',
      //     'farooq1045@gmail.com',
      //   ];

      const subject = `Appcrops Support Message from ${first_name} ${last_name}`;

      const html = this.compile_html_template('index.html', {
        subject,
        first_name,
        last_name,
        email,
        phone: phone || 'Not Provided',
        budget: budget || 'Not Provided',
        message,
        how_we_can_help_you: how_we_can_help_you || 'N/A',
        received_at: new Date().toLocaleString(),
      });

      await this.mailService.sendMail({
        from: 'info@techverticks.com',
        to: 'info@techverticks.com',
        subject,
        html,
        replyTo: email,
      });

      return 'Email Sent Successfully!';
    } catch (error) {
      console.log('Error sending hostiner email ==>', error);
    }
  }
}
