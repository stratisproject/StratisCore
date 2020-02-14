export enum ResultStatus {
    Success,
    Error
}

export class Result<T> {

    status: ResultStatus;
    message: string;
    value?: T;

    constructor(status: ResultStatus, message: string, value: T = null) {
        this.status = status;
        this.message = message;
        this.value = value;
    }

    public static ok<T>(value: T = null): Result<T> {
        return new Result(ResultStatus.Success, null, value);
    }

    public static fail<T>(message: string): Result<T> {
        return new Result(ResultStatus.Error, message);
    }

    public get success(): boolean {
        return this.status === ResultStatus.Success;
    }

    public get failure(): boolean {
        return this.status === ResultStatus.Error;
    }
}
