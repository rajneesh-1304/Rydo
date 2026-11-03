import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RequestRideHandler } from './request-ride.service';
import { RequestRideDto } from './request-ride.dto';
import { RequestRideCommand } from './request-ride.command';

@Controller('rides')
export class RequestRideController {
  constructor(private readonly handler: RequestRideHandler) {}

  @Post('request')
  async handle(
    @Body() data: RequestRideDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new RequestRideCommand(data);
    const ride = await this.handler.handle(command);
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'Ride requested successfully',
      data: ride,
    });
  }
}
