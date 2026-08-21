import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// mongooseAggregatePaginate is a plugin that allows us to paginate the results of an aggregate query. 

const commentSchema = Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    },
    {
        timestamps: true
    }
)

// to use the mongoose-aggregate-paginate-v2 plugin, we need to add it to the schema
commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)