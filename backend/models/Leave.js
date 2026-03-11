const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leave = sequelize.define('Leave',{

    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },

    startDate:{
        type:DataTypes.DATE,
        allowNull:false
    },

    endDate:{
        type:DataTypes.DATE,
        allowNull:false
    },

    reason:{
        type:DataTypes.TEXT,
        allowNull:false
    },

    status:{
        type:DataTypes.ENUM('Pending','Approved','Rejected'),
        defaultValue:'Pending'
    },

    decisionAt:{
        type:DataTypes.DATE
    }

},{
    timestamps:true
});

module.exports = Leave;