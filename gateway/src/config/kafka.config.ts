import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

export const KAFKA_TOPICS = {
  TOURNAMENT_JOIN_COMMAND: 'tournament.join.command',
  TOURNAMENT_MY_TOURNAMENTS_QUERY: 'tournament.my-tournaments.query',
} as const;

export const TOURNAMENT_KAFKA_CLIENT = 'TOURNAMENT_KAFKA_CLIENT';

export const kafkaClientConfig: ClientProviderOptions = {
  name: TOURNAMENT_KAFKA_CLIENT,
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'gateway',
      brokers: [(process.env.KAFKA_BROKERS ?? 'localhost:9092')],
    },
    consumer: {
      groupId: 'gateway-consumer',
    },
    producer: {
      allowAutoTopicCreation: true,
      createPartitioner: Partitioners.LegacyPartitioner,
    },
    serialize: (value: any) => Buffer.from(JSON.stringify(value)),
  },
};
