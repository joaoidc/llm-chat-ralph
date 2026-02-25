import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './controllers/health.controller';
import { DocumentController } from './controllers/document.controller';
import { ChatController } from './controllers/chat.controller';
import { DocumentEntity } from './entities/document.entity';
import { DocumentService } from './services/document.service';
import { LlmService } from './services/llm.service';
import { ChatService } from './services/chat.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'your_password',
      database: 'llm_chat_platform',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
      useUTC: true,
      extra: {
        ssl: false,
      },
    }),
  ],
  controllers: [HealthController, DocumentController, ChatController],
  providers: [DocumentService, LlmService, ChatService, DocumentEntity],
})
export class AppModule {}
