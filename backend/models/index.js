const sequelize = require('../config/database');

const Student = require('./Student');
const Warden = require('./Warden');
const Room = require('./Room');
const Floor = require('./Floor');
const AllocationCycle = require('./AllocationCycle');
const StudentAllocation = require('./StudentAllocation');
const RoomSelection = require('./RoomSelection');
const Movement = require('./Movement');
const Leave = require('./Leave');
const Complaint = require('./Complaint');


// ROOM RELATIONS
Floor.hasMany(Room);
Room.belongsTo(Floor);

AllocationCycle.hasMany(Floor);
Floor.belongsTo(AllocationCycle);

AllocationCycle.hasMany(Room);
Room.belongsTo(AllocationCycle);


// STUDENT ROOM
Room.hasMany(Student, { as: "Students", foreignKey: "RoomId" });
Student.belongsTo(Room, { foreignKey: "RoomId" });


// MERIT LIST
Student.hasMany(StudentAllocation);
StudentAllocation.belongsTo(Student);

AllocationCycle.hasMany(StudentAllocation);
StudentAllocation.belongsTo(AllocationCycle);


// ROOM SELECTION
Student.hasOne(RoomSelection);
RoomSelection.belongsTo(Student);

Room.hasMany(RoomSelection);
RoomSelection.belongsTo(Room);

AllocationCycle.hasMany(RoomSelection);
RoomSelection.belongsTo(AllocationCycle);


// MOVEMENT
Student.hasMany(Movement);
Movement.belongsTo(Student);


// LEAVE
Student.hasMany(Leave);
Leave.belongsTo(Student);

Warden.hasMany(Leave);
Leave.belongsTo(Warden);


// COMPLAINT
Student.hasMany(Complaint);
Complaint.belongsTo(Student);


module.exports = {
    sequelize,
    Student,
    Warden,
    Room,
    Floor,
    AllocationCycle,
    StudentAllocation,
    RoomSelection,
    Movement,
    Leave,
    Complaint
};