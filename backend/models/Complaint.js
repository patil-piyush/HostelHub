const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint',{

    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },

    title:{
        type:DataTypes.STRING,
        allowNull:false
    },

    description:{
        type:DataTypes.TEXT,
        allowNull:false
    },

    category:{
        type:DataTypes.STRING
    },

    status:{
        type:DataTypes.ENUM('Open','In Progress','Resolved'),
        defaultValue:'Open'
    },

    resolvedAt:{
        type:DataTypes.DATE
    }

},{
    timestamps:true
});

module.exports = Complaint;