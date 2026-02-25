import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    const { username, password, role } = dto;
    const hashedPassword = await hash(password, 10);
    const user = new UserEntity();
    user.username = username;
    user.password = hashedPassword;
    user.role = role;
    return await this.userRepository.save(user);
  }

  async validateUser(username: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) return null;
    const isPasswordValid = await this.validatePassword(password, user.password);
    return isPasswordValid ? user : null;
  }

  private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await hash(password, 10) === hashedPassword;
  }
}
