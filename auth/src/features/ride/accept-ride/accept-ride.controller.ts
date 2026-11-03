import { Body, Controller, HttpStatus, Param, Patch, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AcceptRideHandler } from './accept-ride.service';
import { AcceptRideDto } from './accept-ride.dto';
import { AcceptRideCommand } from './accept-ride.command';

@Controller('rides')
export class AcceptRideController {
  constructor(private readonly handler: AcceptRideHandler) {}

  @Patch(':uuid/accept')
  async handle(
    @Param('uuid') uuid: string,
    @Body() data: AcceptRideDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new AcceptRideCommand(uuid, data.driver_id);
    const ride = await this.handler.handle(command);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Ride accepted successfully',
      data: ride,
    });
  }
}
