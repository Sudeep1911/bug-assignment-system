import { Controller, Post, Body, Get, Param } from '@nestjs/common';
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
}
