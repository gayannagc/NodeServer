let mongoose = require('mongoose');

//creating Schema to structuring
let rdsignSchema = mongoose.Schema({
    sign_name : {
        type : String,
        required : true
    },
    long : {
        type : String,
        required: true
    },
    lat : {
        type : String,
        required : true
    },
    head : {
        type : String,
        required : true
    },
    road : {
        type : String,
        required : true
    },
    areaCode : {
        type : String,
        required : true
    },
    code : {
        type : String,
        required : true
    }
        
});

let rd_sign = module.exports = mongoose.model('road_signs',rdsignSchema);

