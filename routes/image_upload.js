const express = require('express');
const router = express.Router();
const rd_sign = require('../models/road_sign')
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const multer = require('multer');
const mongoose = require('mongoose');
const config = require('../config/database')

mongoose.connect("mongodb://localhost:27017/active_rs",{ useNewUrlParser: true })
conn = mongoose.connection;

//init gfs
let gfs;
conn.once('open', function(){
    //init stream
    gfs = Grid(conn.db, mongoose.mongo);
    //collection name
    gfs.collection('fs');
});


//create storge object
const storage = new GridFsStorage({
    url: config.database,
    file: (req, file) => {
      return {
        filename: req.params.filename,
      }
    }
  });
const upload = multer({ storage });

router.get("/:filename", function(req,res){
    let file = {};
    file.filename = req.params.filename;
    res.render('upload_image',{
        file : file
    })
})


router.post('/:filename',upload.single('fileNew'), function(req,res){
    console.log(req.params.filename)
    res.redirect('/')
})

module.exports = router;