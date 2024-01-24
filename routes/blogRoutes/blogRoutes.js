const express = require('express');
const blogController=require('../../controllers/blogController/blogController');
const authenticate = require('../../middleware/auth');

const router=express.Router();

//no auth required

//advanced endpoints
router.get('/popularBlogs',blogController.getMostPopularBlogs);
router.get('/searchBlogs',blogController.searchBlogs);
//in the frontend search should be debounced for rate limiting purposes and decreasing load on server
router.get('/getLatestN',blogController.getLatestNBlogs);

router.get('/', blogController.getAllBlogs);
router.post('/', authenticate, blogController.createBlog);

router.get('/:blogId', blogController.getBlogById);
//no auth required
//added auth middleware to these routes
router.put('/:blogId', authenticate, blogController.updateBlog);
router.delete('/:blogId', authenticate, blogController.deleteBlog);




module.exports = router;