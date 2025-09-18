// user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  password: string;

  @ApiProperty({ enum: ['admin', 'developer', 'tester'] })
  role: 'admin' | 'developer' | 'tester';

  @ApiProperty({ example: 'John Doe' })
  name: string;
}

export class SignInDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  password: string;
}

export class EmployeeDto {
  @ApiProperty({ enum: ['developer', 'tester'] })
  role: 'developer' | 'tester';

  @ApiProperty({ example: 'jane@company.com' })
  email: string;

  @ApiProperty({ example: 'Jane Smith' })
  name: string;
}

export class CreateEmployeesDto {
  @ApiProperty({ type: [EmployeeDto] })
  employees: EmployeeDto[];

  @ApiProperty({ example: '60af924ad1234567bc123456' })
  companyId: string;
}
export class ModuleDto {
  @ApiProperty({ example: '68a2ca5abb6726fc0e94966d' })
  module: string;

  @ApiProperty({ example: 1 })
  proficiency: number;
}

export class UserDetailsDto {
  @ApiProperty({ example: '68c27370bc32b5ae8ea811ad' })
  companyId: string;

  @ApiProperty({ type: [ModuleDto] })
  modules: ModuleDto[];
}

export class SignInResponseDto {
  @ApiProperty({ example: '689c2c79ec8d42c147e33a7a' })
  _id: string;

  @ApiProperty({ example: '71762133044@cit.edu.in' })
  email: string;

  @ApiProperty({ example: 'subbu@' })
  password: string;

  @ApiProperty({ example: 'Subramanian' })
  name: string;

  @ApiProperty({ example: 'admin' })
  role: 'admin' | 'developer' | 'tester';

  @ApiProperty({ example: 0 })
  __v: number;

  @ApiProperty({ type: UserDetailsDto })
  details: UserDetailsDto;
}

export class ApiUnauthorizedResponseCreate {
  @ApiProperty({
    example: '401',
  })
  statusCode: number;
  @ApiProperty({
    example: 'Invalid credentials',
  })
  message: string;
}

export class EmailNotFoundResponse {
  @ApiProperty({
    example: '404',
  })
  statusCode: number;
  @ApiProperty({
    example: 'User not found',
  })
  message: string;
}

export class ApiBadRequestResponseCreate {
  @ApiProperty({
    example: '404',
  })
  statusCode: number;
  @ApiProperty({
    example: 'Company not found',
  })
  message: string;
}

export class CreatedEmployeeResponse {
  @ApiProperty({ example: true })
  created: boolean;
}
