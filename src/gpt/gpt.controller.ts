import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OpenAI } from 'openai';
import { GPTService } from './gpt.sevice';

@Controller('gpt')
export class GPTController {
  constructor(private gptService: GPTService) {}
  @Post('conversation')
  async getCategory(
    @Body()
    body: {
      projectId: string;
      desc: string;
      type:"dev"|"test"
    },
  ) {
    const result = await this.gptService.getCategoryAndPriority(
      body.projectId,
      body.desc,
      body.type
    );
    return result;
  }
}
