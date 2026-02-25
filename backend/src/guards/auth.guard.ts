import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
