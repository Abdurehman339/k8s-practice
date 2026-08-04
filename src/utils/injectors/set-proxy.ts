import { ExpressAdapter } from '@nestjs/platform-express';

export default function SetTrustProxy(adapter: ExpressAdapter) {
  adapter.set('trust proxy', 1);
}
