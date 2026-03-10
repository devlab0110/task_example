import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { UsersClient } from './users.client';
import { natsClientConfig } from '../config/nats.config';

@Module({
  imports: [ClientsModule.register([natsClientConfig])],
  providers: [UsersClient],
  exports: [UsersClient],
})
export class UsersModule {}
