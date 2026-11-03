import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DriverGetHandler } from './get-driver.service';
import { DriverGetQuery } from './get-driver.query';

@Controller('drivers')
export class DriverGetController {
  constructor(private readonly handler: DriverGetHandler) { }

  @Get(':uuid')
  async getOne(
    @Param('uuid') uuid: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const query = new DriverGetQuery(uuid);
    const driver = await this.handler.handle(query);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Driver information retrieved successfully',
      data: driver,
    });
  }
}
