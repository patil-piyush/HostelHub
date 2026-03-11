const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {

    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },

    name:{
        type: DataTypes.STRING,
        allowNull:false
    },

    email:{
        type: DataTypes.STRING,
        allowNull:false,
        unique:true
    },

    password:{
        type: DataTypes.STRING,
        allowNull:false
    },

    PRN:{
        type: DataTypes.STRING,
        allowNull:false,
        unique:true
    },

    branch:{
        type: DataTypes.STRING,
        allowNull:true
    },

    year:{
        type: DataTypes.INTEGER,
        allowNull:true
    },

    CGPA:{
        type: DataTypes.FLOAT,
        defaultValue:0
    },

    contactNumber:{
        type: DataTypes.STRING,
        allowNull:true
    },

    permanentAddress:{
        type: DataTypes.TEXT,
        allowNull:true
    },

    currentAddress:{
        type: DataTypes.TEXT,
        allowNull:true
    },

    profilePicture:{
        type: DataTypes.STRING,
        allowNull:true
    },

    parentName:{
        type: DataTypes.STRING,
        allowNull:true
    },

    parentEmail:{
        type: DataTypes.STRING,
        allowNull:true
    },

    parentContactNumber:{
        type: DataTypes.STRING,
        allowNull:true
    },

    guardianName:{
        type: DataTypes.STRING,
        allowNull:true
    },

    guardianEmail:{
        type: DataTypes.STRING,
        allowNull:true
    },

    guardianContactNumber:{
        type: DataTypes.STRING,
        allowNull:true
    },

    guardianAddress:{
        type: DataTypes.TEXT,
        allowNull:true
    }

},{
    timestamps:true
});

module.exports = Student;