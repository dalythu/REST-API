'use strict';

const express = require('express');

const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');
const User = require('./models').User;
const Course = require ('./models').Course;
const bcrypt = require('bcryptjs'); // used for password hashing 


// Construct a router instance.
const router = express.Router();


/*
User Routes
*/

// GET route that returns the current authenticated user.
router.get('/users', authenticateUser, asyncHandler(async (req, res) => { // tells express to route to users > authenticated users > async handler 
    const user = req.currentUser;
    if(user){
        res.status(200).json(user);
    }
}));

//POST route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
    try {
        const user = req.body;
        if(user.password){user.password = await bcrypt.hash(user.password, 10);}
        await User.create(user);
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
    if (courses){
        res.status(200).json(courses);
   } else {
       res.status(400).json({message: "No courses could be found"})
   }
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
        res.location(`/courses/${course.id}`).status(201).end();
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
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = req.body;
    const clientUser = req.currentUser.id;
    try {
        if(req.currentUser.id) {
            const courseOwner = await Course.findByPk(req.params.id).userId;
             if(clientUser == courseOwner){
                 await Course.update(course, {where: { id: req.params.id}})
                res.status(204).end();
            } else {
                res.status(403).json({message: "You are not authourized to modify this course."});
            }
        }
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

// Delete Route that will delete a course
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const clientUser = req.currentUser.dataValues.id;
    if(clientUser) {
        const courseOwner = await Course.findByPk(req.params.id).userId;
         if(clientUser == courseOwner){
            await courseToDelete.destroy();
            res.status(204).end();
        } else {
            res.status(403).json({message: "You are not authourized to modify this course."});
        }
    } else {
        res.status(403).json({message: "You are not authourized to modify this course."});
    }
}));

module.exports = router;