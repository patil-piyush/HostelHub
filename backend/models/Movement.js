const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movement = sequelize.define('Movement',{

    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },

    outTime:{
        type:DataTypes.DATE,
        allowNull:false
    },

    inTime:{
        type:DataTypes.DATE
    },

    reason:{
        type:DataTypes.STRING
    },

    status:{
        type:DataTypes.ENUM('OUT','IN'),
        defaultValue:'OUT'
    }

},{
    timestamps:true
});

module.exports = Movement;