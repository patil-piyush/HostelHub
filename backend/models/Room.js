const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room',{

    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },

    roomNumber:{
        type:DataTypes.STRING,
        unique:true,
        allowNull:false
    },

    block:{
        type:DataTypes.STRING,
        allowNull:false
    },

    floor:{
        type:DataTypes.INTEGER,
        allowNull:false
    },

    capacity:{
        type:DataTypes.INTEGER,
        defaultValue:3
    }

},{
    timestamps:true
});

module.exports = Room;