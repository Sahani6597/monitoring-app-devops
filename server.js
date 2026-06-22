import express from "express";
import cors from "cors";
import {config} from "dotenv";
import metricsRouter from "./routes/metrics.js";

//Load environment variables first
config();

//App Initialization
const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Metrics API
app.use("/api/v11/metrics", metricsRouter);

//Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});