import { Injectable, NotFoundException } from '@nestjs/common';
import { UserResponseDto } from './dto/user-response.dto';

const HARDCODED_USERS: UserResponseDto[] = [
  {
    id: 'player-001',
    username: 'dragonSlayer',
    email: 'dragon@example.com',
    skill: 1500,
    country: 'BG',
  },
  {
    id: 'player-002',
    username: 'nightOwl',
    email: 'owl@example.com',
    skill: 1800,
    country: 'DE',
  },
  {
    id: 'player-003',
    username: 'speedRunner',
    email: 'speed@example.com',
    skill: 2100,
    country: 'US',
  },
  {
    id: 'player-004',
    username: 'proGamer99',
    email: 'pro@example.com',
    skill: 950,
    country: 'FR',
  },
  {
    id: 'player-005',
    username: 'ironFist',
    email: 'iron@example.com',
    skill: 1650,
    country: 'BG',
  },
];

@Injectable()
export class UsersService {
  findById(id: string): UserResponseDto {
    const user = HARDCODED_USERS.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  findAll(): UserResponseDto[] {
    return HARDCODED_USERS;
  }
}
