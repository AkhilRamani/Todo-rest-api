const mongoose=require('mongoose');
const validator=require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt= require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate:{
            validator: validator.isEmail,
            message: '{VALUE} is not valid Email'
        }       
    },  
    password : {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access:{
            type: String,
            required: true
        },
        token:{
            type: String,
            required: true
        }
    }]
});

UserSchema.pre('save', function(next){
    var user= this;

    if(user.isModified('password')){
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(user.password, salt, (err, hash)=>{
                user.password= hash;
                next(); 
            });
        });
    }else{
        next();
    }
});

UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'Auth';
    var token= jwt.sign({_id: user._id.toHexString(),access},'akhil').toString();

    user.tokens.push({access, token});

    return user.save().then(()=>{
        return token;
    });
};

UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;
    
    try {    
        decoded = jwt.verify(token,'akhil');
    }catch(e){
        return Promise.reject();
    }
    
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'Auth'
    });
};

var User = mongoose.model('User',UserSchema);

module.exports= {User};