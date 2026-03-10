import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { kafkaClientConfig } from '../config/kafka.config';

@Module({
  imports: [ClientsModule.register([kafkaClientConfig])],
  controllers: [TournamentsController],
  providers: [TournamentsService],
})
export class TournamentsModule {}
