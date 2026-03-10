import { IsString } from 'class-validator';

export class GetMyTournamentsDto {
  @IsString()
  playerId: string;
}
