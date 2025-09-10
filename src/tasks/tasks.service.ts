import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Task } from './tasks.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KanbanStage } from 'src/kanbanStages/kanbanStages.schema';
import { GPTService } from 'src/gpt/gpt.sevice';
import { CreateTaskDto } from './tasks.dto';
import { GcpService } from './gcp.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel('Task') private taskModel: Model<Task>,
    @InjectModel('KanbanStages') private kanbanStageModel: Model<KanbanStage>,
    private gptService: GPTService,
    private gcpService: GcpService,
  ) {}

  async createTask(
    body: CreateTaskDto,
    attachments?: Express.Multer.File[],
  ): Promise<Task> {
    const { taskId } = body;

    // If a taskId is provided, attempt to update the existing task
    if (taskId) {
      const existingTask = await this.taskModel.findById(taskId).exec();
      if (!existingTask) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      const newAttachments = [];
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          const fileData = await this.gcpService.uploadFile(file);
          newAttachments.push(fileData);
        }
      }

      // Append new attachments to the existing ones
      body.attachments = [...existingTask.attachments, ...newAttachments];

      // Check if the status has changed and the new status is 'Testing'
      if (
        body.status &&
        body.status.toString() !== existingTask.status.toString()
      ) {
        const kanbanStages = await this.kanbanStageModel
          .find({ projectId: body.projectId })
          .exec();
        const testingStage = kanbanStages.find(
          (stage) => stage.name === 'Testing',
        );

        if (
          testingStage &&
          body.status.toString() === testingStage._id.toString()
        ) {
          const conversation = await this.gptService.getCategoryAndPriority(
            existingTask.projectId,
            existingTask.description,
            'test',
          );
          if (conversation) {
            body.priority = conversation.priority as any;
            body.assignedTo = conversation.assignedDeveloper.employeeId;
          }
        }
      }

      const updatedTask = await this.taskModel
        .findOneAndUpdate({ _id: taskId }, body, { new: true })
        .exec();

      if (updatedTask) {
        return updatedTask;
      }
    }

    // Logic for creating a new task
    const newAttachments = [];
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        const fileData = await this.gcpService.uploadFile(file);
        newAttachments.push(fileData);
      }
    }
    body.attachments = newAttachments;

    // If taskId was not provided, or it was provided but no existing task was found,
    // create a new task.
    const newTask = new this.taskModel(body);
    return await newTask.save();
  }

  async getTaskById(taskId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ taskId }).exec();
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    // Get signed URLs for all attachments
    if (task.attachments && task.attachments.length > 0) {
      const attachmentsWithUrls = await this.getAttachmentsWithSignedUrls(
        task.attachments,
      );
      // Replace the original attachments with the ones containing signed URLs
      task.attachments = attachmentsWithUrls as any;
    }

    return task;
  }

  async getAllTasks(projectId: string): Promise<Task[]> {
    const tasks = await this.taskModel.find({ projectId }).exec();
    const tasksWithSignedUrls = [];

    for (const task of tasks) {
      if (task.attachments && task.attachments.length > 0) {
        const attachmentsWithUrls = await this.getAttachmentsWithSignedUrls(
          task.attachments,
        );
        // Create a new object to avoid modifying the original Mongoose document directly
        const taskWithUrls = {
          ...task.toObject(),
          attachments: attachmentsWithUrls,
        };
        tasksWithSignedUrls.push(taskWithUrls);
      } else {
        tasksWithSignedUrls.push(task);
      }
    }

    return tasksWithSignedUrls as any;
  }

  private async getAttachmentsWithSignedUrls(
    attachments: any[],
  ): Promise<any[]> {
    const attachmentsWithUrls = [];
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (!attachment.filePath) {
          // Skip attachments with missing file paths to prevent the error
          console.warn(
            'Skipping attachment with missing filePath:',
            attachment,
          );
          continue;
        }
        try {
          const url = await this.gcpService.getSignedUrl(attachment.filePath);
          attachmentsWithUrls.push({
            ...attachment.toObject(), // Use toObject() for Mongoose documents
            signedUrl: url,
          });
        } catch (error) {
          console.error(
            `Failed to get signed URL for ${attachment.filePath}:`,
            error,
          );
          // You can decide how to handle the error, e.g., return null or an empty URL
          attachmentsWithUrls.push({
            ...attachment.toObject(),
            signedUrl: null, // Or a placeholder
          });
        }
      }
    }
    return attachmentsWithUrls;
  }
}
