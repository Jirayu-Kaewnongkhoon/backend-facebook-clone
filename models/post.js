const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
    }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;