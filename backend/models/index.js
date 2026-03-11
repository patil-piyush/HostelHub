const sequelize = require('../config/database');

const Student = require('./Student');
const Warden = require('./Warden');
const Room = require('./Room');
const Movement = require('./Movement');
const Leave = require('./Leave');
const Complaint = require('./Complaint');

Room.hasMany(Student);
Student.belongsTo(Room);

Student.hasMany(Movement);
Movement.belongsTo(Student);

Student.hasMany(Leave);
Leave.belongsTo(Student);

Warden.hasMany(Leave);
Leave.belongsTo(Warden);

Student.hasMany(Complaint);
Complaint.belongsTo(Student);

module.exports = {
    sequelize,
    Student,
    Warden,
    Room,
    Movement,
    Leave,
    Complaint
};