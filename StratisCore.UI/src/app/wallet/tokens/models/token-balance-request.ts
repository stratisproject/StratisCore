export class TokenBalanceRequest {
    contractAddress: string;
    senderAddress: string;
    methodName = "GetBalance";
    amount = 0;
    gasPrice = 100;
    gasLimit = 100000;
    parameters = [];

    constructor(tokenAddress: string, senderAddress: string) {
        this.contractAddress = tokenAddress;
        this.senderAddress = senderAddress;
    }
}