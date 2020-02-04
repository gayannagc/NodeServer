const express = require('express');
const router = express.Router();
const rd_sign = require('../models/road_sign')
const multer = require('multer');
const mongoose = require('mongoose');
const config = require('../config/database')
const categorization = require('../config/categorization')

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
                        heading : location.head,
                        image_code : location.code
                    }
                    locationList.push(data);
                }
                
            })            
            res.json(locationList)
        }
    })
})

router.post('/upload/locations', function(req,res){
    console.log("reached")
    let signs = new rd_sign();
    signs.sign_name = req.body.sign_name;
    signs.long = req.body.longitude;
    signs.lat = req.body.latitude;
    signs.head = req.body.heading;
    signs.road = "Galle road";
    signs.areaCode = "21";
    signs.code = req.body.image_code;

    signs.save(function(err){
        if(err){
            console.log('submit error: ',err)
            return;
        }else{
            req.flash('success','Road Sign Added');
            res.redirect('/');
        }
    });  
})

module.exports = router;