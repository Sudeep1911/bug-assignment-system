import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'The name of the company.',
    example: 'ACME Inc.',
  })
  name: string;

  @ApiProperty({
    description: 'The ID of the company owner.',
    example: '507f1f77bcf86cd799439011',
  })
  ownerId: string;

  @ApiProperty({
    description: 'The industry of the company.',
    example: 'Technology',
  })
  industry: string;

  @ApiProperty({
    description: 'A brief description of the company.',
    example: 'A leading provider of technological solutions.',
  })
  description: string;
}

export class ApiBadRequestResponseCreate {
  @ApiProperty({
    example: '404',
  })
  statusCode: number;
  @ApiProperty({
    example: 'User not found',
  })
  message: string;
}

export class CreateCompanyResponseDto {
  @ApiProperty({
    description: 'The name of the company.',
    example: 'ACME Inc.',
  })
  name: string;

  @ApiProperty({
    description: 'The ID of the company owner.',
    example: '689c2c79ec8d42c147e33a7a',
  })
  ownerId: string;

  @ApiProperty({
    description: 'The industry of the company.',
    example: 'Technology',
  })
  industry: string;

  @ApiProperty({
    description: 'A brief description of the company.',
    example: 'A leading provider of technological solutions.',
  })
  description: string;

  @ApiProperty({
    description: 'The unique ID of the created company.',
    example: '68c27370bc32b5ae8ea811ad',
  })
  _id: string;

  @ApiProperty({
    description: 'The creation timestamp.',
    example: '2025-09-11T07:00:00.155Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'The last update timestamp.',
    example: '2025-09-11T07:00:00.155Z',
  })
  updatedAt: string;

  @ApiProperty({ description: 'The document version key.', example: 0 })
  __v: number;
}

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user.',
    example: '689c2c79ec8d42c147e33a7a',
  })
  _id: string;

  @ApiProperty({
    description: 'User email address.',
    example: 'jane@company.com',
  })
  email: string;

  @ApiProperty({
    description: 'Full name of the user.',
    example: 'Jane Smith',
  })
  name: string;

  @ApiProperty({
    description: 'Role assigned to the user.',
    example: 'developer',
  })
  role: string;

  @ApiProperty({
    description: 'Version key for the document.',
    example: 0,
  })
  __v: number;

  @ApiProperty({
    description: 'Additional user details including company and module info.',
    example: {
      companyId: '68c27370bc32b5ae8ea811ad',
      modules: [
        {
          module: '68a2ca5abb6726fc0e94966d',
          proficiency: 1,
        },
      ],
    },
  })
  details: {
    companyId: string;
    modules: {
      module: string;
      proficiency: number;
    }[];
  };
}
