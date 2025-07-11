import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Register a new user
  @Post('signup')
  async createUser(
    @Body()
    body: {
      email: string;
      password: string;
      role: 'admin' | 'developer' | 'tester';
      name: string;
    },
  ) {
    return this.usersService.createUser(
      body.email,
      body.password,
      body.role,
      body.name,
    );
  }

  // Get user by email
  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Post('signin')
  async signIn(@Body() body: { email: string; password: string }) {
    return this.usersService.signIn(body.email, body.password);
  }
}
