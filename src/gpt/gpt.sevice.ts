import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class GPTService {
  constructor() {}
  async getCategoryandPriority(desc: string, categories: string[]) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4', // Use GPT-4 model
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant.',
            },
            {
              role: 'user',
              content: `Categorize the following bug description: "${desc}". The categories are: ${categories} and priorities are: High,medium,low. Please choose the most relevant category and priority. Just give in the format of Category: X, Priority: Y.`,
            },
          ],
          max_tokens: 20,
        },
        {
          headers: {
            Authorization: process.env.CHATGPT_KEY,
            'OpenAI-Organization': process.env.ORG_KEY,
            'Content-Type': 'application/json',
          },
        },
      );

      const resultText = response.data.choices[0].message.content.trim(); // Get the response text

      // Parse the response into a JSON format with category and priority
      const [category, priority] = resultText
        .split(',')
        .map((item) => item.split(':')[1].trim());

      const resultJson = {
        category: category,
        priority: priority,
      };
      return resultJson;
    } catch (error) {
      console.error('Error categorizing bug:', error);
      return 'Uncategorized'; // Default fallback
    }
  }
}
