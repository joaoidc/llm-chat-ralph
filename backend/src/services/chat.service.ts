import { Injectable } from '@nestjs/common';
import { DocumentService } from './document.service';
import { LlmService } from './llm.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly documentService: DocumentService,
    private readonly llmService: LlmService,
  ) {}

  async getResponse(question: string): Promise<string> {
    const queryEmbedding = this.generateEmbedding(question);
    const similarDocuments = await this.documentService.findSimilarDocuments(queryEmbedding);
    const context = similarDocuments.map(doc => doc.text).join('\n');
    const prompt = `Context: ${context}\nQuestion: ${question}\nAnswer:`;
    return this.llmService.generateResponse(prompt);
  }

  private generateEmbedding(text: string): number[] {
    return Array.from({ length: 768 }, () => Math.random());
  }
}
