const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Analytics = sequelize.define('Analytics', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },

  totalStudents: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  activeStudents: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  totalComplaints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  resolvedComplaints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  pendingLeaves: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  approvedLeaves: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  occupancyRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }

}, {
  timestamps: true
});

module.exports = Analytics;