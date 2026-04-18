import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//import routes-> yaha sabhi axis user ko mil gaya ab ab jo bhi call hoga... /user/resistre or /user/login 
//every thing right in user.routes.js file, now we do not use app.js 
import userRouter from "./routes/user.routes.js"
//routes declarations.....
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/user/resister -> /user bhi direct likh sakte the pr ye standard practice he

export default app