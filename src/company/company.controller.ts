import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  @Post('create')
  async createCompany(
    @Body()
    body: {
      name: string;
      ownerId: string;
      industry: string;
      description: string;
    },
  ) {
    return this.companyService.createCompany(
      body.name,
      body.ownerId,
      body.industry,
      body.description,
    );
  }

  @Get(':id/users')
  async getUsersByCompanyId(@Param('id') companyId: string) {
    return this.companyService.getUsersByCompanyId(companyId);
  }

  @Get(":id")
  async getCompanyById(@Param('id') companyId: string) {
    return this.companyService.getCompanyById(companyId);
  }

  @Put(':id')
  async updateCompany(
    @Param('id') companyId: string,
    @Body()
    body: any,
  ) {
    return this.companyService.updateCompany(companyId, body);
  }
}
