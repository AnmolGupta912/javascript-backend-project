
// this is the class for handling the api error
 

class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went worng!!",
        errors = [],
        stack = ""
    ){
        super(message)
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