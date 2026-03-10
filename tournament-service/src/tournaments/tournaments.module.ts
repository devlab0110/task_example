import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { Tournament } from '../entities/tournament.entity';
import { PlayerTournament } from '../entities/player-tournament.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tournament, PlayerTournament]),
    UsersModule,
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService],
})
export class TournamentsModule {}
