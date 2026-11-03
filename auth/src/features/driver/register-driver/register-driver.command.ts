import { SaveDriverDto } from './register-driver.dto';

export class SaveDriverCommand {
  constructor(public readonly driver: SaveDriverDto) { }
}
