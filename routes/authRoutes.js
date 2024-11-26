const express = require('express');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');


const router = express.Router();

router.post('/signup', userController.signup);// **Signup Route**
router.post('/login', userController.login);// **Login Route (Mobile OTP)*
router.post('/send-otp', userController.sendOtp);// **Send OTP Route**
router.post('/forget-password', userController.forgetPassword);// **Forget Password Route**

router.get('/dashboard', jwtMiddleware.jwtMiddleware, userController.dashboard);// User dashboard

router.get('/admin/users', jwtMiddleware.jwtMiddleware, jwtMiddleware.isAdmin, adminController.listUsers);// List all users
router.post('/admin/users', jwtMiddleware.jwtMiddleware, jwtMiddleware.isAdmin, adminController.createUser);// Create a user
router.get('/admin/users/:id', jwtMiddleware.jwtMiddleware, jwtMiddleware.isAdmin, adminController.getUserById);// Get a single user by ID
router.put('/admin/users/:id', jwtMiddleware.jwtMiddleware, jwtMiddleware.isAdmin, adminController.updateUser);// Update a user by ID
router.delete('/admin/users/:id', jwtMiddleware.jwtMiddleware, jwtMiddleware.isAdmin, adminController.softDeleteUser);// Soft delete a user by ID

module.exports = router;