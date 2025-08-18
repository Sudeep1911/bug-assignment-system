import { Controller, Post, Body, Get, Param, Patch, Put } from '@nestjs/common';

import { Types } from 'mongoose';
import { ProjectService } from './product.service';
import { CreateProjectDto } from './product.dto';

@Controller('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  // Create a new project
  @Post('create')
async createProject(@Body() body: CreateProjectDto) {
  return this.projectService.createProject(body);
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
  @Get('user/:userId')
  async getProjectsByUserId(@Param('userId') userId: string) {
    const userIdObj = new Types.ObjectId(userId); // Convert the user ID to ObjectId
    return this.projectService.getProjectsByUserId(userIdObj);
  }

  @Put(':id')
  async updateProject(
    @Param('id') projectId: string,
    @Body() body: CreateProjectDto,
  ) {
    const projectIdObj = new Types.ObjectId(projectId); // Convert the project ID to ObjectId
    return this.projectService.updateProject(projectIdObj, body);
  }

  @Get(':id/users')
    async getProjectUsers(@Param('id') projectId: string) {
    const projectIdObj = new Types.ObjectId(projectId); // Convert the project ID to ObjectId
    return this.projectService.getProjectUsers(projectIdObj);
  }

  @Get(':id/modules')
  async getProjectModules(@Param('id') projectId: string) {
    const projectIdObj = new Types.ObjectId(projectId); // Convert the project ID to ObjectId
    return this.projectService.getProjectModules(projectIdObj);
  }
}
