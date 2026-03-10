import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Hybrid app: primarily a Kafka microservice
  const app = await NestFactory.create(AppModule);

  // Connect Kafka microservice transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'tournament-service',
        brokers: [(process.env.KAFKA_BROKERS ?? 'localhost:9092')],
      },
      consumer: {
        groupId: 'tournament-service-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('Tournament service Kafka consumer started');
}

bootstrap();
