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
connectDB("mongodb+srv://proectnova:qIPaIQWO0z9BjGgB@cluster0.eu4py.mongodb.net");

// Define Schema
const testvidios = connectDB.validation('testvidios', {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    devicename: { type: String, required: false },
    date: { type: String, required: false },
    fromtime: { type: String, required: false },
    totime: { type: String, required: false },
    latitude:{type:String,required:true},
    longitude:{type:String,required:true}
    
}, { timestamps: false });
// **POST /create**
app.post("/create", async (req, res) => {
    try {
        const { url, filename, divisename, date, fromtime, totime } = req.body;

        if (!url || !filename) {
            return res.status(400).json({ message: "url and filename are required" });
        }

        const newRecord = await testvidios.create({ url, filename, divisename, date, fromtime, totime });
        res.status(201).json({ message: "Record added successfully", data: newRecord });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

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
