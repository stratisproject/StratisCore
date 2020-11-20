export class Network {
  constructor(destinationName: string, federationAddress: string, description: string ) {
    this.destinationName = destinationName;
    this.federationAddress = federationAddress;
    this.description = description;
  }

  public destinationName: string;
  public federationAddress: string;
  public description: string;
}
