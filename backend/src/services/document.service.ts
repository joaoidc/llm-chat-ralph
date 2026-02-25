import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '../entities/document.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}

  async createDocument(dto: CreateDocumentDto): Promise<DocumentEntity> {
    const { text } = dto;

    // Mock chunking (split text into chunks)
    const chunks = this.chunkText(text, 100); // Example chunk size

    // Mock embedding generation (replace with actual model)
    const embedding = this.generateEmbedding(text);

    const document = new DocumentEntity();
    document.text = text;
    document.embedding = embedding;

    return await this.documentRepository.save(document);
  }

  async findSimilarDocuments(embedding: number[]): Promise<DocumentEntity[]> {
    return this.documentRepository
      .createQueryBuilder('document')
      .orderBy('document.embedding <-> :embedding', 'ASC')
      .setParameter('embedding', embedding)
      .take(5)
      .getMany();
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private generateEmbedding(text: string): number[] {
    // Mock embedding (replace with actual model)
    return Array.from({ length: 768 }, () => Math.random());
  }
}
