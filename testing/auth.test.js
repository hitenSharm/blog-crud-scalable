const request = require('supertest');
const app=require('../index');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Mock the User model methods
jest.mock('../models/User');

describe('registerUser', () => {
    
    test('should return 201 and message if registration is successful', async () => {        
        const userData = {
            email: 'test@example.com',
            password: 'password'
        };

        User.findOne.mockResolvedValue(null);
        //means no existing user with value was found
        
        User.prototype.save.mockResolvedValue(userData);

        const response = await request(app)
            .post('/auth/register')
            .send(userData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Registration successful');
    });

    test('should return 400 if user with given email already exists', async () => {
        const userData = {
            email: 'existing@example.com',
            password: 'password'
        };
        
        User.findOne.mockResolvedValue({});

        const response = await request(app)
            .post('/auth/register')
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User with this email already exists');
    });
});

describe('loginUser', () => {
    test('should return 200 and token if login is successful', async () => {
        const userData = {
            email: 'test@example.com',
            password: 'password'
        };

        const user = {
            _id: '123',
            email: 'test@example.com',
            password: await bcrypt.hash(userData.password, 10)
        };
        
        User.findOne.mockResolvedValue(user);

        const response = await request(app)
            .post('/auth/login')
            .send(userData);

        expect(response.status).toBe(200);
        expect(response.body.token).toBeTruthy();
    });

    test('should return 401 if email is invalid', async () => {
        const userData = {
            email: 'nonexistent@example.com',
            password: 'password'
        };
        
        User.findOne.mockResolvedValue(null);

        const response = await request(app)
            .post('/auth/login')
            .send(userData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid email');
    });

    test('should return 401 if password is invalid', async () => {        
        const userData = {
            email: 'test@example.com',
            password: 'invalidpassword'
        };

        const user = {
            _id: '123',
            email: 'test@example.com',
            password: await bcrypt.hash('password', 10)
        };

        User.findOne.mockResolvedValue(user);

        const response = await request(app)
            .post('/auth/login')
            .send(userData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid password');
    });
});
