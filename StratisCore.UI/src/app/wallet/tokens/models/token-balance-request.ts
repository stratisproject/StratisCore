export class TokenBalanceRequest {
    contractAddress: string;
    sender: string;
    methodName = 'GetBalance';
    amount = 0;
    gasPrice = 100;
    gasLimit = 100000;
    parameters: string[] = [];

    constructor(tokenAddress: string, senderAddress: string) {
        this.contractAddress = tokenAddress;
        this.sender = senderAddress;
        this.parameters.push(`9#${senderAddress}`);
    }
}
