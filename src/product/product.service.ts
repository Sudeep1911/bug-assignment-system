import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Employee } from 'src/employee/employee.schema';
import { EmployeeRepo } from 'src/employee/employee.repo';
import { Project } from './product.schema';

@Injectable()
export class ProjectService {
  constructor(@InjectModel('Project') private projectModel: Model<Project>) {}

  // Create a new project
  async createProject(
    companyId: Types.ObjectId,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    kanbanStages: string[] = ['To Do', 'In Progress', 'Done'],
    modules: string[] = ['Frontend', 'Backend', 'Database'],
    employees: Types.ObjectId[] = [], // Employee IDs to be assigned to the project
  ) {
    const newProject = new this.projectModel({
      companyId,
      name,
      description,
      startDate,
      endDate,
      kanbanStages,
      employees,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newProject.save();
  }

  // Get a project by its ID and populate the employees
  async getProjectWithEmployees(projectId: Types.ObjectId) {
    const project = await this.projectModel
      .findById(projectId)
      .populate('employees'); // Populate the employees field with full employee data
    return project;
  }

  // Add employees to an existing project
  async addEmployeesToProject(
    projectId: Types.ObjectId,
    employeeIds: Types.ObjectId[],
  ) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.employees.push(...employeeIds); // Add new employees to the project
    project.updatedAt = new Date(); // Update the updatedAt field
    await project.save();

    return project;
  }
}
