const dotenv=require('dotenv');
const app=require('./app')
const connectDB=require('./config/db')
dotenv.config();
connectDB();
const PORT=process.env.port||5000;
app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
})