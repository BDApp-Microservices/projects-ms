
export class BaseResponseDto<T> {
    success: boolean;
    message: string;
    data: any | T;
    error?: any;
    statusCode?: number;

    constructor(
        success: boolean,
        message: string,
        data?: T,
        error?: any,
        statusCode?: number,
    ) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
        this.statusCode = statusCode;
    }

    static success<T>(
        data: T,
        message: string,
        statusCode?: number,
    ): BaseResponseDto<T> {
        return new BaseResponseDto<T>(true, message, data, undefined, statusCode);
    }

    static error<T>(
        message: string,
        statusCode?: number,
        error?: any,
    ): BaseResponseDto<T> {
        return new BaseResponseDto<T>(false, message, undefined, error, statusCode);
    }
}