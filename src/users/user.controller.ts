// users.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UsersService } from './user.service';
import {
  CreateUserDto,
  SignInDto,
  CreateEmployeesDto,
  SignInResponseDto,
  ApiUnauthorizedResponseCreate,
  EmailNotFoundResponse,
  CreatedEmployeeResponse,
  ApiBadRequestResponseCreate,
} from './user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiBadRequestResponse({ description: 'User already exists' })
  async createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(
      body.email,
      body.password,
      body.role,
      body.name,
    );
  }

  @Get(':email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({ name: 'email', description: 'User email' })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: SignInResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: EmailNotFoundResponse,
  })
  async getUserByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in user' })
  @ApiBody({ type: SignInDto })
  @ApiCreatedResponse({
    description: 'User signed in successfully',
    type: SignInResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ApiUnauthorizedResponseCreate,
  })
  async signIn(@Body() body: SignInDto) {
    return this.usersService.signIn(body.email, body.password);
  }

  @Post('create')
  @ApiOperation({ summary: 'Bulk create employees for a company' })
  @ApiBody({ type: CreateEmployeesDto })
  @ApiCreatedResponse({
    description: 'Employees created or already exist',
    type: CreatedEmployeeResponse,
  })
  @ApiNotFoundResponse({
    description: 'Company not found',
    type: ApiBadRequestResponseCreate,
  })
  async createEmployees(@Body() body: CreateEmployeesDto) {
    return await this.usersService.createEmployees(
      body.employees,
      body.companyId,
    );
  }
}
