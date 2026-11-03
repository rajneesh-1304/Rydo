import { UpdateDriverDto } from './update.dto';

export class DriverUpdateCommand {
  constructor(
    public readonly uuid: string,
    public readonly data: UpdateDriverDto,
  ) {}
}
