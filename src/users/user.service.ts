import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { UsersRepo } from './user.repo';

@Injectable()
export class UsersService {
  constructor(private userRepo: UsersRepo) {}

  // Create a new user
  async createUser(
    email: string,
    password: string,
    role: 'admin' | 'developer' | 'tester',
    name?: string,
  ): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const newUser = await this.userRepo.createUser(email, password, role, name);
    return newUser;
  }

  // Find a user by email
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (user.password !== password) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
