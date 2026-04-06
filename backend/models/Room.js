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
        allowNull:false,
        unique: true   // 🔥 IMPORTANT
    },

    capacity:{
        type:DataTypes.INTEGER,
        defaultValue:3
    },

    occupiedBeds:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },

    status:{
        type:DataTypes.ENUM(
            'available',
            'full',
            'reserved',
            'maintenance'
        ),
        defaultValue:'available'
    }

},{
    timestamps:true
});

module.exports = Room;