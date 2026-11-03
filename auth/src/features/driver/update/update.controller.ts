import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { DriverUpdateHandler } from './update.service';
import { UpdateDriverDto } from './update.dto';
import { DriverUpdateCommand } from './update.command';

@Controller('drivers')
export class DriverUpdateController {
  constructor(private readonly handler: DriverUpdateHandler) {}

  @Patch(':uuid')
  async patch(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateDriverDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new DriverUpdateCommand(uuid, dto);
    const driver = await this.handler.handle(command);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Driver information updated successfully',
      data: driver,
    });
  }
}
