import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiProperty,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiAcceptedResponse,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CompanyService } from './company.service';
import {
  ApiBadRequestResponseCreate,
  CreateCompanyDto,
  CreateCompanyResponseDto,
} from './company.dto';

// Add @ApiProperty() decorators to each property in the DTO

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiNotFoundResponse({ type: ApiBadRequestResponseCreate })
  @ApiCreatedResponse({ type: CreateCompanyResponseDto })
  async createCompany(@Body() body: CreateCompanyDto) {
    return this.companyService.createCompany(
      body.name,
      body.ownerId,
      body.industry,
      body.description,
    );
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get users by company ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async getUsersByCompanyId(@Param('id') companyId: string) {
    return this.companyService.getUsersByCompanyId(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async getCompanyById(@Param('id') companyId: string) {
    return this.companyService.getCompanyById(companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiNotFoundResponse({ type: ApiBadRequestResponseCreate })
  @ApiOkResponse({ type: CreateCompanyResponseDto })
  async updateCompany(
    @Param('id') companyId: string,
    @Body() body: CreateCompanyDto,
  ) {
    return this.companyService.updateCompany(companyId, body);
  }
}
