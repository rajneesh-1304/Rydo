import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserUpdateHandler } from './update-user.service';
import { UpdateUserDto } from './update-user.dto';
import { UpdateUserCommand } from './update-user.command';

@Controller('users')
export class UserUpdateController {
  constructor(private readonly handler: UserUpdateHandler) { }

  @Patch(':uuid')
  async patch(
    @Param('uuid') uuid: string,
    @Body() data: UpdateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new UpdateUserCommand(uuid, data);
    const user = await this.handler.handle(command);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'User information updated successfully',
      data: user,
    });
  }
}
