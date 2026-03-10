import { ClientProviderOptions, Transport } from '@nestjs/microservices';

export const NATS_PATTERNS = {
  GET_USER_BY_ID: 'user.get_by_id',
} as const;

export const NATS_CLIENT = 'NATS_CLIENT';

export const natsClientConfig: ClientProviderOptions = {
  name: NATS_CLIENT,
  transport: Transport.NATS,
  options: {
    servers: [process.env.NATS_URL ?? 'nats://localhost:4222'],
  },
};
