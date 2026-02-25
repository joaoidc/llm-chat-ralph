import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/user.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto): Promise<void> {
    await this.userService.createUser(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body('username') username: string, @Body('password') password: string): Promise<{ access_token: string }> {
    const user = await this.userService.validateUser(username, password);
    if (!user) throw new Error('Invalid credentials');
    const payload = { username: user.username, sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}
