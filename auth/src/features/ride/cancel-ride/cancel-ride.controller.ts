import { Body, Controller, HttpStatus, Param, Patch, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CancelRideHandler } from './cancel-ride.service';
import { CancelRideDto } from './cancel-ride.dto';
import { CancelRideCommand } from './cancel-ride.command';

@Controller('rides')
export class CancelRideController {
  constructor(private readonly handler: CancelRideHandler) {}

  @Patch(':uuid/cancel')
  async handle(
    @Param('uuid') uuid: string,
    @Body() data: CancelRideDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new CancelRideCommand(uuid, data?.reason);
    const ride = await this.handler.handle(command);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Ride cancelled successfully',
      data: ride,
    });
  }
}
