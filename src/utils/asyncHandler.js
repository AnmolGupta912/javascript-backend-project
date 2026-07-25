const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promiss.resolve(requestHandler(res, req, next)).catch((err) => next(err))
    }
}


export {asyncHandler}





/*
NOTE: this code is mush easier to read and understand but there is a better approch to handle with promiss

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.send(error.code || 500).json({
            success: true,
            massage: error.massage
        })
    }
}
*/


