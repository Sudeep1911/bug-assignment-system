import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Task } from "./tasks.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { KanbanStage } from "src/kanbanStages/kanbanStages.schema";
import { GPTService } from "src/gpt/gpt.sevice";

@Injectable()
export class TaskService {
  constructor(
    @InjectModel('Task') private taskModel: Model<Task>, 
    @InjectModel('KanbanStages') private kanbanStageModel: Model<KanbanStage>,
    private gptService: GPTService
  ) {}

  async createTask(body: Task): Promise<Task> {
    const { taskId } = body;

    // If a taskId is provided, attempt to update the existing task
    if (taskId) {
      const existingTask = await this.taskModel.findById(taskId).exec();
      if (!existingTask) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      // Check if the status has changed and the new status is 'Testing'
      if (body.status && body.status.toString() !== existingTask.status.toString()) {
        const kanbanStages = await this.kanbanStageModel.find({ projectId: body.projectId }).exec();
        const testingStage = kanbanStages.find(stage => stage.name === "Testing");

        if (testingStage && body.status.toString() === testingStage._id.toString()) {
          const conversation = await this.gptService.getCategoryAndPriority(existingTask.projectId, existingTask.description, "test");
          if (conversation) {
            body.priority = conversation.priority as any;
            body.assignedTo = conversation.assignedDeveloper.employeeId;
          }
        }
      }

      const updatedTask = await this.taskModel.findOneAndUpdate(
        { _id: taskId },
        body,
        { new: true }
      ).exec();

      if (updatedTask) {
        return updatedTask;
      }
    }

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
    return task;
  }

  async getAllTasks(projectId: string): Promise<Task[]> {
    const tasks = await this.taskModel.find({ projectId }).exec();
    return tasks;
  }
}
