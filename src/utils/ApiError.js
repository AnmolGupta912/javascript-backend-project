class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went worng!!",
        errors = [],
        stack = ""
    ){
        super(messages)
        this.message = message
        console.log("ApiError data: ",this.data)
        this.data = null
        this.success = false
        this.errors = errors


        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }