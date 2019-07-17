export class TransferInfo {
    from: string;
    to: string;
    value: number;
}

export class Log {
    address: string;
    topics: string[];
    data: string;
}

export class LocalExecutionResult {
    gasConsumed: number;
    revert: boolean;
    return: any;
    internalTransfers: TransferInfo[];
    logs: Log[];
}
