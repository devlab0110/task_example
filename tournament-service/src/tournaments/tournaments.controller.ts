import { Controller, Logger } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  KafkaContext,
  Ctx,
  RpcException,
} from '@nestjs/microservices';
import { TournamentsService } from './tournaments.service';
import { KAFKA_TOPICS } from '../config/kafka.config';
import { JoinTournamentDto } from './dto/join-tournament.dto';

@Controller()
export class TournamentsController {
  private readonly logger = new Logger(TournamentsController.name);

  constructor(private readonly tournamentsService: TournamentsService) {}

  /**
   * Kafka Command: tournament.join.command
   * Sent by gateway when player wants to join
   */
  @MessagePattern(KAFKA_TOPICS.TOURNAMENT_JOIN_COMMAND)
  async handleJoinTournament(
    @Payload() data: any,
    @Ctx() context: KafkaContext,
  ) {
  
    const dto: JoinTournamentDto = typeof data === 'string' ? JSON.parse(data) : data;
    
    try {
      const result = await this.tournamentsService.joinTournament(dto);
      return result;
    } catch (error) {
      this.logger.error(`[Kafka] Join failed: ${error.message}`);
      throw new RpcException({
        statusCode: error.status ?? 500,
        message: error.message ?? 'Internal server error',
      });
    }
  }

  /**
   * Kafka Query: tournament.my-tournaments.query
   * Sent by gateway when player requests their tournaments
   */
  @MessagePattern(KAFKA_TOPICS.TOURNAMENT_MY_TOURNAMENTS_QUERY)
  async handleGetMyTournaments(
    @Payload() payload: { playerId: string },
    @Ctx() context: KafkaContext,
  ) {

    try {
      const results = await this.tournamentsService.getMyTournaments(
        payload.playerId,
      );
      return results;
    } catch (error) {
      this.logger.error(`[Kafka] Query failed: ${error.message}`);
      throw new RpcException({
        statusCode: error.status ?? 500,
        message: error.message ?? 'Internal server error',
      });
    }
  }
}



