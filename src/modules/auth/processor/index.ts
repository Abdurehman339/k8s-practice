import { Processor, Process } from '@nestjs/bull';
import { DatabaseService } from 'src/database/database.service';
import { Job } from 'bull';
import { SendgridEmail } from 'utils/service/sendgrid';
import { TSendgridEmail } from '../types';

@Processor('auth')
export class AuthProcessor {
  constructor(
    private readonly _database: DatabaseService,
    private readonly _sendgrid: SendgridEmail,
  ) {}

  @Process('email:send')
  async email(job: Job<TSendgridEmail>) {
    const { email, name, code, type, subject, text } = job.data;

    await this._sendgrid.send({
      to: email,
      name,
      subject,
      text,
      type,
      code,
    });
  }
}
