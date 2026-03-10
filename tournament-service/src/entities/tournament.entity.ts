import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PlayerTournament } from './player-tournament.entity';

export enum TournamentStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gameType: string;

  @Column()
  tournamentType: string;

  @Column('decimal', { precision: 10, scale: 2 })
  entryFee: number;

  @Column({
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.OPEN,
  })
  status: TournamentStatus;

  @Column({ default: 8 })
  maxPlayers: number;

  @OneToMany(() => PlayerTournament, (pt) => pt.tournament, { cascade: true })
  playerTournaments: PlayerTournament[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
