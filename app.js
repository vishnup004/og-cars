import express from "express";
import "dotenv/config"
import {connectDB} from "./config/db.js"
import {sessionConfig} from "./config/session.js";
import userRouter from "./routes/userRouter.js";

const app = express();

const PORT = process.env.PORT || 5000;

app.set("view engine", "ejs")   
app.use(express.static("public"))
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(sessionConfig);
app.use(userRouter)


app.listen(PORT, () => console.log(`server running on ${PORT}`))