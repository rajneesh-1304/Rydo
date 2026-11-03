import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UserGetHandler } from './get-user.service';
import { GetUserQuery } from './get-user.query';

interface AuthenticatedRequest extends Request {
  user: {
    uuid: string;
    email: string;
    role: string;
  };
}

@Controller('users')
export class UserGetController {
  constructor(private readonly handler: UserGetHandler) { }

  @Get('me')
  async getOne(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const uuid = req.user.uuid;
    const query = new GetUserQuery(uuid);
    const user = await this.handler.handle(query);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'User information retrieved successfully',
      data: user,
    });
  }
}
