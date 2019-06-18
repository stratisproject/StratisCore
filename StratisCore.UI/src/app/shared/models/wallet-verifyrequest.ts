export class VerifyRequest {
  constructor(signature: string, externalAddress: string, message: string) {
    this.signature = signature;
    this.externalAddress = externalAddress;
    this.message = message;
  }

  signature: string;
  externalAddress: string;
  message: string;
}
