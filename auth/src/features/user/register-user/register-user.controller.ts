import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RegisterUserDto } from './register-user.dto';
import { UserSaveHandler } from './register-user.service';
import { RegisterUserCommand } from './register-user.command';

@Controller('users')
export class UserSaveController {
  constructor(private readonly handler: UserSaveHandler) { }

  @Post()
  async handle(
    @Body() data: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new RegisterUserCommand(data);

    const user = await this.handler.handle(command);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'User information saved successfully',
      data: user,
    });
  }
}
