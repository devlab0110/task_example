import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Tournament } from './tournament.entity';

@Entity('player_tournaments')
@Unique(['playerId', 'tournamentId'])
export class PlayerTournament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string;

  @Column()
  playerUsername: string;

  @Column()
  tournamentId: string;

  @ManyToOne(() => Tournament, (t) => t.playerTournaments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;

  @CreateDateColumn()
  joinedAt: Date;
}
