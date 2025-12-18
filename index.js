import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js";
import { app, server } from "./socket/socket.js"

dotenv.config();

const port = process.env.PORT || 5000;


// 🔴 MIDDLEWARE MUST COME FIRST
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔴 ROUTES AFTER MIDDLEWARE
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);


server.listen(port, () => {
  connectDb();
  console.log("Server is started");
});
