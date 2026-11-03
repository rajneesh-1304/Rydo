import { RequestRideDto } from './request-ride.dto';

export class RequestRideCommand {
  constructor(public readonly ride: RequestRideDto) {}
}
