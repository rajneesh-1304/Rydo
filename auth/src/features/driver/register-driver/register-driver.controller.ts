import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DriverSaveHandler } from './register-driver.service';
import { SaveDriverDto } from './register-driver.dto';
import { SaveDriverCommand } from './register-driver.command';

@Controller('drivers')
export class DriverSaveController {
  constructor(private readonly handler: DriverSaveHandler) { }

  @Post()
  async handle(
    @Body() data: SaveDriverDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new SaveDriverCommand(data);
    const driver = await this.handler.handle(command);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Driver information saved successfully',
      data: driver,
    });
  }
}
