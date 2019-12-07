const express = require('express');
const router = express.Router();
const rd_sign = require('../models/road_sign')
const multer = require('multer');
const mongoose = require('mongoose');
const config = require('../config/database')

router.get('/locations/:code', function(req,res){
    var query = {areaCode : req.params.code}
    rd_sign.find({}, function(err, locations){
        console.log(locations)
        if(err){
            res.json({locations : 'not available'})
        }else{
            let locationList = [];
            locations.forEach(function(location, index){
                if(location.areaCode == query.areaCode){
                    var data = {
                        id : location._id,
                        longitude : location.long,
                        lattitude : location.lat,
                        image_code : location.code
                    }
                    locationList.push(data);
                }
                
            })            
            res.json(locationList)
        }
    })
})

module.exports = router;