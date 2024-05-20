import express from "express";
import "express-async-errors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";
import url from "url";

import dbConnect from "./db/connect.js";
import notFoundMiddleware from "./middlewares/NotFound.js";
import errorHandlerMiddleware from "./middlewares/error-handler.js";
import authRouter from "./routes/authRoutes.js";

const app = express();
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use("/api/v1/auth", authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 4000;
const startServer = () => {
  try {
    dbConnect(process.env.MONGO_URI);
    console.log("Connected to Database successfully.");
    app.listen(PORT, console.log(`Server started at http://localhost:${PORT}`));
  } catch (error) {
    console.log(error);
  }
};
startServer();
