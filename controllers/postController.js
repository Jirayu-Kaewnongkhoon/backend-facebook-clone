const Post = require('../models/post');


module.exports.getPosts = (req, res) => {
    console.log(req.cookies.jwt);
    
    Post.find().sort({ createdAt: -1 })
        .then(result => res.send({ data: { posts: result }}))
        .catch(err => console.log(err))
}

module.exports.addPost = (req, res) => {
    const post = new Post(req.body);

    post.save()
        .then(result => res.send({ data: { post }}))
        .catch(err => console.log(err))
}