import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Project } from './product.schema';
import { CreateProjectDto } from './product.dto';
import { KanbanStage } from 'src/kanbanStages/kanbanStages.schema';
import { Modules } from 'src/modules/modules.schema';
import { User } from 'src/users/user.schema';
import { TaskService } from 'src/tasks/tasks.service';

@Injectable()
export class ProjectService {
constructor(
  @InjectModel('Project') private projectModel: Model<Project>,
  @InjectModel('KanbanStages') private kanbanStageModel: Model<KanbanStage>,
  @InjectModel('Modules') private moduleModel: Model<Modules>,
@InjectModel('User') private userModel: Model<User>,
private taskService: TaskService, // Assuming you have a TaskService to handle tasks
) {}

  // Create a new project
async createProject(body: CreateProjectDto) {
  const {
    adminId,
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
    employees: [
      new Types.ObjectId(adminId),
      ...employees.map((e) => new Types.ObjectId(e.employeeId))
    ], // include adminId
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

  // Get projects by user ID, including modules for each project
  async getProjectsByUserId(userId: Types.ObjectId) {
    const projects = await this.projectModel.find({ employees: userId });
    const projectsWithModules = await Promise.all(
      projects.map(async (project) => {
        const modules = await this.moduleModel.find({ projectId: project._id });
        const kanbanStages = await this.kanbanStageModel.find({ projectId: project._id });
        return {
          ...project.toObject(),
          modules,
          kanbanStages,
        };
      })
    );
    return projectsWithModules;
  }

  async updateProject(
    projectId: Types.ObjectId,
    body: CreateProjectDto,
  ) {
    const project=await this.projectModel.findByIdAndUpdate(
      { _id: projectId },
      body,
      { new: true }
    ).exec();
    return project;
  }

  async getProjectUsers(projectId: Types.ObjectId) {
    const project = await this.projectModel
        .findById(projectId)
        .populate('employees');

      if (!project) {
        throw new Error('Project not found');
      }

      // Get all tasks for the project
      const tasks = await this.taskService.getAllTasks(projectId.toString());

      // Map employees with their respective tasks
      const employeesWithTasks = project.employees.map((employee: any) => {
        const employeeTasks = tasks.filter(
          (task: any) => task.assignedTo?.toString() === employee._id.toString()
        );

        return {
          ...employee.toObject?.() ?? employee,
          tasks: employeeTasks,
        };
      });

      return employeesWithTasks;

  }

  async getProjectModules(projectId: Types.ObjectId) {
    const modules = await this.moduleModel.find({ projectId });
    return modules;
  }
}
