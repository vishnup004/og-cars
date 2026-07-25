import express from "express";
import { signup } from "../controllers/userController.js";
const userRouter = express.Router();


userRouter.get("/signup", (req, res) => {
    res.render("user/signup")
})


userRouter.post("/signup",async (req, res) => {
    console.log(req.body)
})


export default userRouter;