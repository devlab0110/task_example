import { IsString, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class JoinTournamentDto {
  @IsString()
  playerId: string;

  @IsString()
  gameType: string;

  @IsString()
  tournamentType: string;

  @IsNumber()
  @IsPositive()
  entryFee: number;
}
