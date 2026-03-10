
import {
  Injectable,
  Inject,
  OnModuleInit,
  RequestTimeoutException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { TOURNAMENT_KAFKA_CLIENT } from '../config/kafka.config';
import { KAFKA_TOPICS } from '../config/kafka.config';
import { JoinTournamentDto } from './dto/join-tournament.dto';

@Injectable()
export class TournamentsService implements OnModuleInit {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(
    @Inject(TOURNAMENT_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(KAFKA_TOPICS.TOURNAMENT_JOIN_COMMAND);
    this.kafkaClient.subscribeToResponseOf(KAFKA_TOPICS.TOURNAMENT_MY_TOURNAMENTS_QUERY);
    await this.kafkaClient.connect();
  }

  async joinTournament(dto: JoinTournamentDto) {
    this.logger.log(`[Kafka] Sending join: ${JSON.stringify(dto)}`);
    return firstValueFrom(
      this.kafkaClient
        .send(KAFKA_TOPICS.TOURNAMENT_JOIN_COMMAND, JSON.stringify(dto))
        .pipe(
          timeout(15000),
          catchError((err) => {
            const error = err?.error ?? err;
            if (error?.statusCode) {
              return throwError(() => new HttpException(error.message, error.statusCode));
            }
            return throwError(() => new RequestTimeoutException('Tournament service did not respond in time'));
          }),
        ),
    );
  }

  
  async getMyTournaments(playerId: string) {
    this.logger.log(`[Kafka] Sending query for player: ${playerId}`);
    return firstValueFrom(
      this.kafkaClient
        .send(KAFKA_TOPICS.TOURNAMENT_MY_TOURNAMENTS_QUERY, JSON.stringify({ playerId }))
        .pipe(
          timeout(15000),
          catchError((err) => {
            const error = err?.error ?? err;
            if (error?.statusCode) {
              return throwError(() => new HttpException(error.message, error.statusCode));
            }
            return throwError(() => new RequestTimeoutException('Tournament service did not respond in time'));
          }),
        ),
    );
  }

}