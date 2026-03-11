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
        allowNull:false
    },

    year:{
        type: DataTypes.INTEGER,
        allowNull:false
    },

    CGPA:{
        type: DataTypes.FLOAT,
        defaultValue:0
    },

    contactNumber:{
        type: DataTypes.STRING,
        allowNull:false
    },

    permanentAddress:{
        type: DataTypes.TEXT,
        allowNull:false
    },

    currentAddress:{
        type: DataTypes.TEXT,
        allowNull:false
    },

    profilePicture:{
        type: DataTypes.STRING
    },

    parentName:{
        type: DataTypes.STRING,
        allowNull:false
    },

    parentEmail:{
        type: DataTypes.STRING,
        allowNull:false
    },

    parentContactNumber:{
        type: DataTypes.STRING,
        allowNull:false
    },

    guardianName:{
        type: DataTypes.STRING,
        allowNull:false
    },

    guardianEmail:{
        type: DataTypes.STRING,
        allowNull:false
    },

    guardianContactNumber:{
        type: DataTypes.STRING,
        allowNull:false
    },

    guardianAddress:{
        type: DataTypes.TEXT,
        allowNull:false
    }

},{
    timestamps:true
});

module.exports = Student;