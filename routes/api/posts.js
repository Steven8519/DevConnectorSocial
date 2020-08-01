const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route     Post api/posts
// @desc      Create a post
// @access    Private
router.post(
    '/',
    [auth, [check('text', 'Text is required').not().isEmpty()]],
    async (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
      }
  
      try {
        const user = await User.findById(request.user.id).select('-password');
  
        const newPost = new Post({
          text: request.body.text,
          name: user.name,
          avatar: user.avatar,
          user: request.user.id
        });
  
        const post = await newPost.save();
  
        response.json(post);
      } catch (error) {
        console.error(error.message);
        response.status(500).send('Server Error');
      }
    }
  );

// @route     GET api/posts
// @desc      GET all posts
// @access    Private
router.get('/', auth, async (request, response)=> {
    try {
        const posts = await Post.find().sort({ date: -1 });
        response.json(posts);
    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
});

// @route     GET api/posts/:id
// @desc      Get post by ID
// @access    Private
router.get('/:id', auth, async (request, response)=> {
    try {
        const post = await Post.findById(request.params.id);

        if (!post) {
            return response.status(404).json({ message: 'Post not found' })
        }
        response.json(post);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return response.status(404).json({ message: 'Post not found' })
        }
        response.status(500).send('Server error');
    }
});

// @route     DELETE api/posts/:id
// @desc      Delete a post
// @access    Private
router.delete('/:id', auth, async (request, response)=> {
    try {
        const post = await Post.findById(request.params.id);

        if (!post) {
            return response.status(404).json({ message: 'Post not found' })
        }

        if(post.user.toString() !== request.user.id) {
            return response.status(401).json({ message: 'User not authorized' })
        }

        await post.remove();

        response.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return response.status(404).json({ message: 'Post not found' })
        }
        response.status(500).send('Server error');
    }
});

// @route     PUT api/posts/like/:id
// @desc      Like a post
// @access    Private
router.put('/like/:id', auth, async (request, response) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post.likes.filter(like => like.user.toString() === request.user.id).length > 0) {
            return response.status(400).json({ message: 'Post has already been liked' });
        }


        post.likes.unshift({ user: request.user.id });

        await post.save();

        response.json(post.likes);
    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
});

// @route     PUT api/posts/unlike/:id
// @desc      Like a post
// @access    Private
router.put('/unlike/:id', auth, async (request, response) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post.likes.filter(like => like.user.toString() === request.user.id).length === 0) {
            return response.status(400).json({ message: 'Post has not yet been liked' });
        }

        const removeIndex = post.likes
        .map(like => like.user
            .toString())
            .indexOf(request.user.id);

        post.likes.splice(removeIndex, 1);

       

        await post.save();

        response.json(post.likes);
    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
});

// @route     Post api/posts/comment/:id
// @desc      Create a post
// @access    Private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required')
]], async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await User.findById(request.user.id).select('-password');
        const post = await Post.findById(request.params.id);

        const newComment = {
        text: request.body.text,
        name: user.name,
        avatar: user.avatar,
        user: request.user.id
        };

        post.comments.unshift(newComment);

        await post.save();
        response.json(post.comments);
        } catch (error) {
            console.error(error.message);
            response.status(500).send('Server error');
        }  
});

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete('/comment/:id/:comment_id', auth, async (request, response) => {
    try {
        const post = await Post.findById(request.params.id);
        const comment = post.comment.find(comment => comment.id === request.params.comment_id);

        if (!comment) {
            return response.status(404).json({ message: 'Comment does not exist' })
        }

        if (comment.user.toString() !== request.user.id) {
            return response.status(404).json({ message: 'User not authorized' });
        }

        const removeIndex = post.likes
        .map(like => like.user
            .toString())
            .indexOf(request.user.id);

        post.comments.splice(removeIndex, 1);

        await post.save();

        response.json(post.comments)
    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
})

module.exports = router;