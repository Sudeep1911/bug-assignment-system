import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';

import { Types } from 'mongoose';
import { ProjectService } from './product.service';

@Controller('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  // Create a new project
  @Post('create')
  async createProject(
    @Body()
    body: {
      companyId: string;
      name: string;
      description: string;
      startDate: Date;
      endDate: Date;
      kanbanStages: string[];
      modules: string[];
      employees: string[]; // Array of employee IDs
    },
  ) {
    const {
      companyId,
      name,
      description,
      startDate,
      endDate,
      kanbanStages,
      modules,
      employees,
    } = body;
    const companyIdObj = new Types.ObjectId(companyId);
    const employeeIds = employees.map((id) => new Types.ObjectId(id)); // Convert employee IDs to ObjectId

    return this.projectService.createProject(
      companyIdObj,
      name,
      description,
      startDate,
      endDate,
      kanbanStages,
      modules,
      employeeIds,
    );
  }

  // Get project details with employee information
  @Get(':id')
  async getProject(@Param('id') projectId: string) {
    const projectIdObj = new Types.ObjectId(projectId); // Convert the project ID to ObjectId
    return this.projectService.getProjectWithEmployees(projectIdObj);
  }

  // Add employees to an existing project
  @Patch(':id/add-employees')
  async addEmployees(
    @Param('id') projectId: string,
    @Body() body: { employeeIds: string[] },
  ) {
    const projectIdObj = new Types.ObjectId(projectId);
    const employeeIds = body.employeeIds.map((id) => new Types.ObjectId(id)); // Convert employee IDs to ObjectId

    return this.projectService.addEmployeesToProject(projectIdObj, employeeIds);
  }
}
