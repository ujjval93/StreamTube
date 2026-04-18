import "dotenv/config";
import connectDB from "./db/db.js";
import app from "./app.js"


console.log(process.env.PORT);

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);    
    })
})
.catch((err)=> {
    console.log("mongoDB connection failed !! ", err);   
})