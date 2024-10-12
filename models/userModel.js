let mongoose = require('mongoose');

let UserSchema = new  mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        require : true,
        unique : true
    },
    password : {
        type : String,
        require : true
    },
    role : {
        type : String,
        enum : ["user" , "admin" , "User" , "Admin"],
        default : "user"
    }
})

let User = mongoose.model('User', UserSchema);
module.exports  = User;
