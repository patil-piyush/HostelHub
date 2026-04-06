// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

// Import dependencies
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');


// Import routes
const authRoutes = require('./routes/authRoute');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wardenRoutes = require('./routes/wardenRoutes');


// Initialize Express app
const app = express();


// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://pccoehostelhub.vercel.app"
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/warden', wardenRoutes);



// Database Connection + Server Start
const PORT = process.env.PORT || 5000;

// sequelize.sync( { alter: true } )
// .then(() => {

//     console.log("Database connected successfully");

//     app.listen(PORT, () => {
//         console.log(`Server running on port ${PORT}`);
//     });

// })
// .catch((err) => {
//     console.error("Database connection failed:", err);
// });

sequelize.authenticate()
.then(() => {
    console.log("Database connected successfully");

    return sequelize.sync(); // no alter
})
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error("DB ERROR:", err);
});

console.log("Auth Routes:", authRoutes);