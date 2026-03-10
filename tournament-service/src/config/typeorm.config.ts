import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Tournament } from '../entities/tournament.entity';
import { PlayerTournament } from '../entities/player-tournament.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/tournaments',
  entities: [Tournament, PlayerTournament],
  synchronize: true, // auto-creates tables; use migrations in production
  logging: process.env.NODE_ENV !== 'production',
};
