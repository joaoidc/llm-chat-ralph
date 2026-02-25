import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateDocumentDto } from '../dto/document.dto';
import { DocumentService } from '../services/document.service';

@Controller()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('documents')
  @HttpCode(HttpStatus.CREATED)
  async createDocument(@Body() dto: CreateDocumentDto): Promise<void> {
    await this.documentService.createDocument(dto);
  }
}
