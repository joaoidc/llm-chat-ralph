import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from '../services/chat.service';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async getChatResponse(@Body() body: { question: string }): Promise<{ answer: string }> {
    const answer = await this.chatService.getResponse(body.question);
    return { answer };
  }
}
