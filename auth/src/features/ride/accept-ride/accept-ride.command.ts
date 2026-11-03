export class AcceptRideCommand {
  constructor(
    public readonly rideUuid: string,
    public readonly driverId: string,
  ) {}
}
