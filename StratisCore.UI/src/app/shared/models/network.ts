export class Network {
  constructor(name: string, federationAddress: string, description: string ) {
    this.name = name;
    this.federationAddress = federationAddress;
    this.description = description;
  }

  public name: string;
  public federationAddress: string;
  public description: string;
}
