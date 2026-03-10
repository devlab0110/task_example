import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament, TournamentStatus } from '../entities/tournament.entity';
import { PlayerTournament } from '../entities/player-tournament.entity';
import { UsersClient } from '../users/users.client';
import { JoinTournamentDto } from './dto/join-tournament.dto';
import { TournamentResponseDto } from './dto/tournament-response.dto';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepo: Repository<Tournament>,
    @InjectRepository(PlayerTournament)
    private readonly playerTournamentRepo: Repository<PlayerTournament>,
    private readonly usersClient: UsersClient,
  ) {}

  /**
   * COMMAND: Join a tournament
   * 1. Validate player exists via NATS → user-service
   * 2. Find open tournament matching criteria or create a new one
   * 3. Add player to tournament
   * 4. Persist to Postgres
   */
  async joinTournament(dto: JoinTournamentDto): Promise<TournamentResponseDto> {
    const { playerId, gameType, tournamentType, entryFee } = dto;

    this.logger.log(`[CMD] Join tournament: player=${playerId}, game=${gameType}`);

    // Step 1: Verify player via NATS → user-service
    const user = await this.usersClient.getUserById(playerId);
    this.logger.log(`[NATS] Got user info: ${user.username}`);

    // Step 2: Check player not already in an open tournament of the same type
    const existingEntry = await this.playerTournamentRepo
      .createQueryBuilder('pt')
      .innerJoin('pt.tournament', 't')
      .where('pt.playerId = :playerId', { playerId })
      .andWhere('t.gameType = :gameType', { gameType })
      .andWhere('t.tournamentType = :tournamentType', { tournamentType })
      .andWhere('t.status = :status', { status: TournamentStatus.OPEN })
      .getOne();

    if (existingEntry) {
      throw new ConflictException(
        `Player "${user.username}" is already in an open ${tournamentType} tournament for ${gameType}`,
      );
    }

    // Step 3: Find an open tournament with available slots or create one
    let tournament = await this.tournamentRepo.findOne({
      where: { gameType, tournamentType, status: TournamentStatus.OPEN },
      relations: ['playerTournaments'],
      order: { createdAt: 'ASC' },
    });

    if (!tournament) {
      tournament = this.tournamentRepo.create({
        gameType,
        tournamentType,
        entryFee,
        status: TournamentStatus.OPEN,
        maxPlayers: 8,
      });
      tournament = await this.tournamentRepo.save(tournament);
      this.logger.log(`[DB] Created new tournament: ${tournament.id}`);
    } else {
      const playerCount = tournament.playerTournaments?.length ?? 0;
      if (playerCount >= tournament.maxPlayers) {
        throw new BadRequestException(
          `Tournament is full (${tournament.maxPlayers}/${tournament.maxPlayers} players)`,
        );
      }
    }

    // Step 4: Add player to tournament
    const playerTournament = this.playerTournamentRepo.create({
      playerId,
      playerUsername: user.username,
      tournamentId: tournament.id,
    });
    await this.playerTournamentRepo.save(playerTournament);
    this.logger.log(`[DB] Player ${user.username} joined tournament ${tournament.id}`);

    // Reload to get fresh player count
    const updated = await this.tournamentRepo.findOne({
      where: { id: tournament.id },
      relations: ['playerTournaments'],
    });

    return this.toResponseDto(updated, playerTournament.joinedAt);
  }

  /**
   * QUERY: Get all tournaments for a player
   */
  async getMyTournaments(playerId: string): Promise<TournamentResponseDto[]> {
    this.logger.log(`[QRY] Get tournaments for player=${playerId}`);

    const entries = await this.playerTournamentRepo.find({
      where: { playerId },
      relations: ['tournament', 'tournament.playerTournaments'],
      order: { joinedAt: 'DESC' },
    });

    return entries.map((entry) =>
      this.toResponseDto(entry.tournament, entry.joinedAt),
    );
  }

  private toResponseDto(
    tournament: Tournament,
    joinedAt?: Date,
  ): TournamentResponseDto {
    return {
      id: tournament.id,
      gameType: tournament.gameType,
      tournamentType: tournament.tournamentType,
      entryFee: Number(tournament.entryFee),
      status: tournament.status,
      maxPlayers: tournament.maxPlayers,
      playerCount: tournament.playerTournaments?.length ?? 0,
      joinedAt,
      createdAt: tournament.createdAt,
    };
  }
}
