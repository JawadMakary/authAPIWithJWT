const User=require('../models/userModel');

exports.getAllUsers=async(req,res)=>{
    try{
        const users=await User.find();
        if(users.length>0){
            res.status(200).json({
                status:200,
                data:users
            })}
            else{
                res.status(404).json({
                    status:404,
                    message:'No user found'
                })
            }

    }catch(err){
        res.json({
            status:500,
            message:err
        })
    }
}