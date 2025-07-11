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
      desc: string;
      categories: string[];
    },
  ) {
    const result = await this.gptService.getCategoryandPriority(
      body.desc,
      body.categories,
    );
    return result;
  }
}
