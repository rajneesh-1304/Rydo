import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GetRideHandler } from './get-ride.service';
import { GetRideQuery } from './get-ride.query';

@Controller('rides')
export class GetRideController {
  constructor(private readonly handler: GetRideHandler) {}

  @Get(':uuid')
  async handle(
    @Param('uuid') uuid: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const query = new GetRideQuery(uuid);
    const ride = await this.handler.handle(query);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Ride information retrieved successfully',
      data: ride,
    });
  }
}
