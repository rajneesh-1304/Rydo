import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RegisterService } from './register.service';
import { RegisterDto } from './register.dto';

@Controller({ path: 'taxi-auth', version: '1' })
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('/register')
  public async handle(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.registerService.register(dto);

    res.cookie('access-token', response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { accessToken, refreshToken, ...profile } = response;

    res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: `${response.role} registered successfully`,
      data: profile,
      accessToken,
      refreshToken,
    });
  }

  @Post('/user/register')
  public async handleUserRegister(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.handle(dto, res);
  }
}
