import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Task } from "./tasks.schema";
import { TaskService } from "./tasks.service";

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post('create')
    async createTask(@Body() body: Task) {
    return this.taskService.createTask(body);
    }

  @Get("")
  async getAllTasks(@Query('projectId') projectId: string) {
    return this.taskService.getAllTasks(projectId);
  }
  @Put(':taskId')
  async updateTask(@Param('taskId') taskId: string, @Body() body: Task) {
    body.taskId = taskId; // Ensure the taskId is set in the body
    return this.taskService.createTask(body);
  }
}