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


// Initialize Express app
const app = express();


// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
app.use('/api/auth', authRoutes);



// Database Connection + Server Start
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
.then(() => {

    console.log("Database connected successfully");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

})
.catch((err) => {
    console.error("Database connection failed:", err);
});