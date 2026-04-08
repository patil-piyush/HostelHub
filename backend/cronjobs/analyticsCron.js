const cron = require('node-cron');
const { 
  Student, 
  Movement, 
  Complaint, 
  Leave, 
  Room,
  Analytics 
} = require('./models');

const { Op } = require('sequelize');

function startAnalyticsCron() {

  cron.schedule('0 0 * * *', async () => {
    console.log("Running Daily Analytics Cron...");

    try {

      const today = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata'
      });

      const totalStudents = await Student.count();

      const activeStudents = await Movement.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      const totalComplaints = await Complaint.count();

      const resolvedComplaints = await Complaint.count({
        where: { status: 'Resolved' }
      });

      const pendingLeaves = await Leave.count({
        where: { status: 'Pending' }
      });

      const approvedLeaves = await Leave.count({
        where: { status: 'Approved' }
      });

      const rooms = await Room.findAll();

      let totalCapacity = 0;
      let occupied = 0;

      rooms.forEach(room => {
        totalCapacity += room.capacity;
        occupied += room.occupiedBeds;
      });

      const occupancyRate = totalCapacity === 0 
        ? 0 
        : (occupied / totalCapacity) * 100;

      await Analytics.upsert({
        date: today,
        totalStudents,
        activeStudents,
        totalComplaints,
        resolvedComplaints,
        pendingLeaves,
        approvedLeaves,
        occupancyRate
      });

      console.log("Analytics stored successfully");

    } catch (err) {
      console.error("Analytics Cron Error:", err);
    }
  });

  console.log("Analytics cron started");
}

module.exports = startAnalyticsCron;