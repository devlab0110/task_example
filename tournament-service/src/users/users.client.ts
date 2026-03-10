import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { NATS_CLIENT , NATS_PATTERNS  } from '../config/nats.config';


export interface UserInfo {
  id: string;
  username: string;
  email: string;
  skill: number;
  country: string;
}

@Injectable()
export class UsersClient {
  constructor(
    @Inject(NATS_CLIENT)
    private readonly natsClient: ClientProxy,
  ) {}

  async getUserById(id: string): Promise<UserInfo> {
    return firstValueFrom(
      this.natsClient
        .send<UserInfo>(NATS_PATTERNS.GET_USER_BY_ID, { id })
        .pipe(
          timeout(5000),
          catchError((err) => {
            const message = err?.error?.message ?? `User "${id}" not found`;
            return throwError(() => new NotFoundException(message));
          }),
        ),
    );
  }
}
