import dotenv from 'dotenv'
import app from './app.ts';
import connectDB from './config/db.ts';
dotenv.config();
connectDB();
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
})