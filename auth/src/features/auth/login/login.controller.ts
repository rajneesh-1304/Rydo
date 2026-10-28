import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LoginService } from './login.service';
import { LoginDto } from './login.dto';

@Controller({ path: 'taxi-auth', version: '1' })
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('/login')
  public async handle(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.loginService.login(dto);

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

    res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: `${response.role} logged in successfully`,
      data: profile,
      accessToken,
      refreshToken,
    });
  }

  @Post('/user/login')
  public async handleUserLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.handle(dto, res);
  }
}
