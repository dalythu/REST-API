'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Model {}
  Course.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A title is required'
        }, 
        notEmpty: {
          msg: 'Please provide a course name'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A course description is required'
        }, 
        notEmpty: {
          msg: 'Please provide a course description'
        }
      }
    },
    estimatedTime: {
        type: DataTypes.STRING,
        allowNull: false,    
        validate: {
          notNull: {
            msg: 'An estimated time is are required'
          }, 
          notEmpty: {
            msg: 'Please provide an estimated time'
          }
        }
      },
  }, { sequelize });

  Course.associate = (models) => {  
    Course.belongsTo(models.User, { //Each course only has one user
      as: 'user', //allias - matches user model 
      foreignKey: { 
        fieldName: 'userId',
        allowNull: false,
      },
    }); 
  };

  return Course;
};