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

    public static ok<T>(value: T = null) {
        return new Result(ResultStatus.Success, null, value);
    }

    public static fail<T>(message: string) {
        return new Result(ResultStatus.Error, message);
    }

    public get success() {
        return this.status === ResultStatus.Success;
    }

    public get failure() {
        return this.status === ResultStatus.Error;
    }
}
