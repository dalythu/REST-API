'use strict';

const express = require('express');

const { asyncHandler } = require('./middleware/async-handler');
const User = require('./models').User;
const Course = require ('./models').Course;
const { authenticateUser } = require('./middleware/auth-user');

// Construct a router instance.
const router = express.Router();

// GET route that returns the current authenticated user.
router.get('/users', authenticateUser, asyncHandler(async (req, res) => { // tells express to route to users > authenticated users > async handler 
    const user = req.currentUser;
    if(user){
        res.status(200).json(user);
    }
}));

/*
User Routes
*/

//POST route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
    try {
        await User.create(req.body);
        res.status(201).json({ "message": "Account successfully created!" });
    } catch (error) {
        console.log('ERROR: ', error.name);

        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
        throw error;
        }
    }
}));

/*
Course Routes
*/
// Get route that returns all courses and the user
router.get('/courses', asyncHandler(async (req, res) => {
    let courses = await Course.findAll({
        include: [
            {
                model: User,
                as: 'user',
                attributes: {
                    exclude: ['password', 'createdAt', 'updatedAt']
                }
            }
        ],
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    });
    res.status(200).json(courses);
}));

//GET route that will return a corresponding course
router.get('/courses/:id', asyncHandler(async (req, res) => {
    let course = await Course.findByPk(req.params.id, 
        {
        include: [
            {
                model: User,
                as: 'user',
                attributes: {
                    exclude: ['password', 'createdAt', 'updatedAt']
                }
            }
        ],
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })
    res.status(200).json(course);
}));

//POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.location(`/courses/${course.id}`);
        res.status(201).end();
    } catch (error) {
        console.log('ERROR: ', error.name);
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({errors});
        } else {
            throw error;
        }
    }
}));

//PUT route that will update the corresponding course




  module.exports = router;