export class LocalCallRequest {
    contractAddress: string;
    sender: string;
    methodName: string;
    amount: number;
    gasPrice = 100;
    gasLimit = 100000;
    parameters: string[] = [];
    constructor(tokenAddress: string, senderAddress: string, methodName: string, amount: number = 0, parameters: string[] = []) {
        this.contractAddress = tokenAddress;
        this.sender = senderAddress;
        this.methodName = methodName;
        this.parameters = parameters;
        this.amount = amount;
    }
}