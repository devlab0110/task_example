import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { NATS_PATTERNS } from '../config/nats.config';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * NATS request-reply: tournament service asks for user info
   * Pattern: 'user.get_by_id'
   * Payload: { id: string }
   */
  @MessagePattern(NATS_PATTERNS.GET_USER_BY_ID)
  getUserById(@Payload() payload: { id: string }) {
    try {
      const user = this.usersService.findById(payload.id);
      return user;
    } catch (error) {
      throw new RpcException({
        status: 404,
        message: error.message ?? 'User not found',
      });
    }
  }
}
