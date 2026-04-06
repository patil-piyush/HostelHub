const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AllocationCycle = sequelize.define('AllocationCycle', {

    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },

    academicYear:{
        type:DataTypes.STRING,
        allowNull:false
    },

    floors:{
        type:DataTypes.INTEGER,
        allowNull:false
    },

    roomsPerFloor:{
        type:DataTypes.INTEGER,
        allowNull:false
    },

    roomCapacity:{
        type:DataTypes.INTEGER,
        defaultValue:3
    },

    freshersReservedRooms:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },

    eligibleStudents:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },

    status:{
        type:DataTypes.ENUM(
            'draft',
            'merit_generated',
            'eligible_set',   
            'selection_open',
            'selection_closed',
            'completed'
        ),
        defaultValue:'draft'
    },

    selectionStartDate:{
        type:DataTypes.DATE
    },

    selectionEndDate:{
        type:DataTypes.DATE
    }

},{
    timestamps:true
});

module.exports = AllocationCycle;