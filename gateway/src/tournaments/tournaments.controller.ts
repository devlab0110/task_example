import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { JoinTournamentDto } from './dto/join-tournament.dto';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  /**
   * POST /tournaments/join
   * Command: join a tournament
   */
  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinTournament(@Body() dto: JoinTournamentDto) {
    const result = await this.tournamentsService.joinTournament(dto);
    return result;
  }

  /**
   * GET /tournaments/players/:playerId/tournaments
   * Query: get tournaments for a player
   */
  @Get('players/:playerId/tournaments')
  async getMyTournaments(@Param('playerId') playerId: string) {
    const result = await this.tournamentsService.getMyTournaments(playerId);
    return result;
  }
}
