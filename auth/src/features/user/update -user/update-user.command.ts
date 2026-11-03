import { UpdateUserDto } from './update-user.dto';

export class UpdateUserCommand {
  constructor(
    public readonly uuid: string,
    public readonly data: UpdateUserDto,
  ) { }
}