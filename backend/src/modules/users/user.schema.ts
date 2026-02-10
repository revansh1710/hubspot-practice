const mongoose=require('mongoose');
const userSchema=new mongoose.schema({
    name:String,
    email:{type:String,unique:true},
    password:String,
    role:{type:String,default:'sales_exec'}
},{timestamps:true});
module.exports=mongoose.model("User",userSchema)