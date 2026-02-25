import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentService } from './document.service';
import { LlmService } from './llm.service';
import { ChatEntity } from '../entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly documentService: DocumentService,
    private readonly llmService: LlmService,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {}

  async getResponse(question: string): Promise<string> {
    const queryEmbedding = this.generateEmbedding(question);
    const similarDocuments = await this.documentService.findSimilarDocuments(queryEmbedding);
    const context = similarDocuments.map(doc => doc.text).join('\n');
    const prompt = `Context: ${context}\nQuestion: ${question}\nAnswer:`;
    const answer = await this.llmService.generateResponse(prompt);

    // Save chat history
    const chat = new ChatEntity();
    chat.question = question;
    chat.answer = answer;
    chat.timestamp = new Date();
    await this.chatRepository.save(chat);

    return answer;
  }

  private generateEmbedding(text: string): number[] {
    return Array.from({ length: 768 }, () => Math.random());
  }
}
