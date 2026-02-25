import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './controllers/health.controller';
import { DocumentEntity } from './entities/document.entity';

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
  controllers: [HealthController],
  providers: [DocumentEntity],
})
export class AppModule {}
