import mongoose, {Schema} from "mongoose";

const subscriptionSchema = Schema(
    {
        subscibers: {
            type: Schema.Types.ObjectId,// the one who is subscribering
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId, // one whom the subscribering
            ref: "User"
        }
    }, 
    {
        timestamps: true
    }
)


export const Subscription = mongoose.model("Subscription", subscriptionSchema)