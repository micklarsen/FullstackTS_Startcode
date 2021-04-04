class ApiError extends Error {
    errorCode: number
    constructor(msg: string, public eCode?: number) {
        super(msg)
        if (Error.captureStackTrace) { // Maintains proper stack trace for where our error was thrown (only available on V8)
            Error.captureStackTrace(this, ApiError)
        }
        this.name = 'ApiError'
        this.errorCode = eCode || 500;
    }
}


export { ApiError }