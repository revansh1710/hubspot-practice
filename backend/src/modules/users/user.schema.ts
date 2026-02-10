const mongoose=require('mongoose');
const schema=mongoose.schema;
const bcrypt=require('bcrypt')
const userSchema=new mongoose.schema({
    name:String,
    email:{type:String,unique:true},
    password:String,
    role:{type:String,default:'sales_exec'}
},{timestamps:true});

userSchema.pre('save',async function  (next:any) {
    try{
        if(schema.isNew){
            const salt=await bcrypt.genSalt(10)
            const hashedPassword=await bcrypt.hash(schema.password,salt);
            schema.password=hashedPassword;
        }
        next();
    }catch(error){
        next(error);
    }
})

userSchema.methods.isValidPassword=async function (password:String) {
    try{
        return await bcrypt.compare(password,schema.password)
    }catch(error){
        throw error;
    }
}
module.exports=mongoose.model("User",userSchema);