const express = require('express');
const authMiddleware = require('./middlewares/authMiddleware');
const adminController = require('./controllers/adminController');
const userController = require('./controllers/userController');
const mediaUpload = require('./middlewares/mediaUpload');

const router = express.Router();

router.post('/signup',mediaUpload, userController.signup);// **Signup Route**
router.post('/login', userController.login);// **Login Route (Mobile OTP)*
router.post('/send-otp', userController.sendOtp);// **Send OTP Route**
router.post('/forget-password',mediaUpload, userController.forgetPassword);// **Forget Password Route**

router.get('/dashboard', authMiddleware.isAuth, userController.dashboard);// User dashboard

router.get('/admin/list-users', authMiddleware.isAuth, authMiddleware.isAdmin, adminController.listUsers);// List all users
router.post('/admin/create-user', authMiddleware.isAuth, authMiddleware.isAdmin, adminController.createUser);// Create a user
router.get('/admin/user/:id', authMiddleware.isAuth, authMiddleware.isAdmin, adminController.getUserById);// Get a single user by ID
router.put('/admin/user/:id', authMiddleware.isAuth, authMiddleware.isAdmin, adminController.updateUser);// Update a user by ID
router.delete('/admin/user/:id', authMiddleware.isAuth, authMiddleware.isAdmin, adminController.softDeleteUser);// Soft delete a user by ID

module.exports = router;