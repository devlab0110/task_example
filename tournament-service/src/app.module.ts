import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '@nestjs/microservices';
import { TournamentsModule } from './tournaments/tournaments.module';
import { typeOrmConfig } from './config/typeorm.config';
import { kafkaClientConfig } from './config/kafka.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ClientsModule.register([kafkaClientConfig]),
    TournamentsModule,
  ],
})
export class AppModule {}