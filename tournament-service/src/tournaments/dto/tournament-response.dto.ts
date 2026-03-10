export class TournamentResponseDto {
  id: string;
  gameType: string;
  tournamentType: string;
  entryFee: number;
  status: string;
  maxPlayers: number;
  playerCount: number;
  joinedAt?: Date;
  createdAt: Date;
}
