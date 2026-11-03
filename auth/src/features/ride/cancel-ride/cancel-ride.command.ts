export class CancelRideCommand {
  constructor(
    public readonly rideUuid: string,
    public readonly reason?: string,
  ) {}
}
