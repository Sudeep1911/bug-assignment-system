import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Employee } from 'src/employee/employee.schema';
import { EmployeeRepo } from 'src/employee/employee.repo';
import { Project } from './product.schema';
import { CreateProjectDto } from './product.dto';
import { KanbanStage } from 'src/kanbanStages/kanbanStages.schema';
import { Modules } from 'src/modules/modules.schema';
import { User } from 'src/users/user.schema';

@Injectable()
export class ProjectService {
constructor(
  @InjectModel('Project') private projectModel: Model<Project>,
  @InjectModel('KanbanStages') private kanbanStageModel: Model<KanbanStage>,
  @InjectModel('Modules') private moduleModel: Model<Modules>,
@InjectModel('User') private userModel: Model<User>,
) {}

  // Create a new project
async createProject(body: CreateProjectDto) {
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
  // Step 1: Create project
  const createdProject = await this.projectModel.create({
    companyId: companyIdObj,
    name,
    description,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    employees: employees.map((e) => new Types.ObjectId(e.employeeId)), // only IDs
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const projectId = createdProject._id;

  // Step 2: Save Kanban Stages
  const kanbanStageDocs = kanbanStages.map((stageName) => ({
    projectId,
    name: stageName,
  }));
  await this.kanbanStageModel.insertMany(kanbanStageDocs);

  // Step 3: Save Modules
  const moduleDocs = modules.map((modName) => ({
    projectId,
    name: modName,
  }));
    const createdModules = await this.moduleModel.insertMany(moduleDocs);

    const moduleMap: Record<string, Types.ObjectId> = {};
  createdModules.forEach((mod) => {
    moduleMap[mod.name] = mod._id;
  });


  for (const emp of employees) {
    const empId = new Types.ObjectId(emp.employeeId);

    const mappedModules = emp.assignedModules.map((assigned) => {
      const moduleObjectId = moduleMap[assigned.moduleId];
      if (!moduleObjectId) {
        throw new Error(`Module ${assigned.moduleId} not found in module list`);
      }

      return {
        module: moduleObjectId,
        proficiency: assigned.proficiency,
      };
    });

    await this.userModel.updateOne(
      { _id: empId },
      {
        $set: {
          'details.companyId': companyIdObj,
          'details.modules': mappedModules,
        },
      },
    );
  }

  return {
    message: 'Project created successfully',
    projectId,
  };
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
