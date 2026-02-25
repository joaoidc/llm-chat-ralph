import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './controllers/health.controller';
import { DocumentController } from './controllers/document.controller';
import { DocumentEntity } from './entities/document.entity';
import { DocumentService } from './services/document.service';
import { LlmService } from './services/llm.service';

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
  controllers: [HealthController, DocumentController],
  providers: [DocumentService, LlmService, DocumentEntity],
})
export class AppModule {}
