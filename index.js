require('dotenv').config();
const connectDB = require('mb64-connect');
const express = require('express');
const cors = require("cors");
const morgan = require("morgan");

const PORT = process.env.PORT || 8100;

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Connect to MongoDB
connectDB(process.env.MONGODB_URI);

// Define Schema
const testvidios = connectDB.validation('testvidios', {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    divisename: { type: String, required: false },
    date: { type: String, required: false },
    fromtime: { type: String, required: false },
    totime: { type: String, required: false }
}, { timestamps: false });

// **GET /find**
app.get("/find", async (req, res) => {
    try {
        const { fromdate, todate, fromtime, totime, divisename } = req.query;

        if (!fromdate || !todate) {
            return res.status(400).json({ message: "Both fromdate and todate are required" });
        }

        const query = { date: { $gte: fromdate, $lte: todate } };
        if (fromtime && totime) {
            query.$and = [{ fromtime: { $gte: fromtime } }, { totime: { $lte: totime } }];
        }
        if (divisename) {
            query.divisename = divisename;
        }

        const result = await testvidios.find(query);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// **GET /check-live**
app.get('/check-live', async (req, res) => {
    try {
        const { fromdate, todate, fromtime, totime, divisename } = req.query;

        const query = { date: { $gte: fromdate, $lte: todate } };
        if (fromtime && totime) {
            query.$and = [{ fromtime: { $gte: fromtime } }, { totime: { $lte: totime } }];
        }
        if (divisename) {
            query.divisename = divisename;
        }

        const result = await testvidios.find(query);
        res.send({ isLive: result.length > 0, urls: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
