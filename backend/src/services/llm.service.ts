import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LlmService {
  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'http://localhost:11434/api/generate',
        {
          model: 'llama3',
          prompt,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'stream',
        }
      );

      return new Promise((resolve, reject) => {
        let fullResponse = '';
        response.data.on('data', (chunk) => {
          fullResponse += chunk;
        });
        response.data.on('end', () => {
          resolve(fullResponse);
        });
        response.data.on('error', (err) => {
          reject(err);
        });
      });
    } catch (error) {
      throw new Error(`Failed to generate response from LLM: ${error.message}`);
    }
  }
}
