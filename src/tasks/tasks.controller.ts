import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Task } from './tasks.schema';
import { TaskService } from './tasks.service';
import { CreateTaskDto } from './tasks.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post('create')
  async createTask(@Body() body: CreateTaskDto) {
    return this.taskService.createTask(body);
  }

  @Get('')
  async getAllTasks(@Query('projectId') projectId: string) {
    return this.taskService.getAllTasks(projectId);
  }
  @Put(':taskId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'attachments' }]))
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() body: any, // Body contains the other data fields
    @UploadedFiles() files: { attachments: Express.Multer.File[] },
  ) {
    // Since other data fields were stringified, you need to parse them back to JSON
    const parsedBody = {
      ...body,
      ...Object.keys(body).reduce((acc, key) => {
        try {
          acc[key] = JSON.parse(body[key]);
        } catch (e) {
          acc[key] = body[key];
        }
        return acc;
      }, {}),
      attachments: files.attachments,
    };

    parsedBody.taskId = taskId;
    return this.taskService.createTask(parsedBody, files.attachments);
  }
}
