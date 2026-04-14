const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({

    fullname:{
        firstname : {
            type : String,
            required : true,
            minlength: [3, 'First name must be at least 3 characters long']
        },
        lastname : {
            type : String,
            minlength: [3, 'Last name must be at least 3 characters long']
        }
    },
    email : {
        type : String,
        required : true,
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
    },
    password : {
        type : String,
        required : true,
    },
    socketId : {
        type : String,
    },
    status : {
        type : String,
        enum : ['active', 'inactive'],
        default : 'inactive'
    },
    vehicle : {
        color : {
            type : String,
            required : true,
            minlength: [3, 'Vehicle color must be at least 3 characters long']
        },
        plate : {
            type : String,
            required : true,
            unique: true,
            minlength: [3, 'Vehicle plate must be at least 3 characters long']
        },
        capacity : {
            type : Number,
            required : true,
            min: [1, 'Vehicle capacity must be at least 1']
        },
        vehicleType : {
            type : String,
            required : true,
            enum : ['car', 'motorcycle', 'auto']
        }
    },
    location : {
        lat : {
            type : Number,
        },
        lng : {
            type : Number,
        }
    }
})

captainSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id : this._id}, process.env.JWT_SECRET, {expiresIn: '86400'});
    return token;
}

captainSchema.methods.comparePassword = async function(pass){
    return await bcrypt.compare(pass, this.password);
}

captainSchema.statics.hashPassword = async function(password){
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

const captainModel = mongoose.model('captain', captainSchema);

module.exports = captainModel;