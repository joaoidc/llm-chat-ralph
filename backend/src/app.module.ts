import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './controllers/health.controller';
import { DocumentController } from './controllers/document.controller';
import { ChatController } from './controllers/chat.controller';
import { DocumentEntity } from './entities/document.entity';
import { DocumentService } from './services/document.service';
import { LlmService } from './services/llm.service';
import { ChatService } from './services/chat.service';
import { UserEntity } from './entities/user.entity';
import { UserService } from './services/user.service';
import { AuthController } from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'your_jwt_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
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
  controllers: [HealthController, DocumentController, ChatController, AuthController],
  providers: [DocumentService, LlmService, ChatService, UserService, JwtStrategy, AuthGuard],
})
export class AppModule {}
