const express = require('express');
const router = express.Router();
const rd_sign = require('../models/road_sign')
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const multer = require('multer');
const mongoose = require('mongoose');
const config = require('../config/database')
const csvtojson = require('csvtojson')
const categorization = require('../config/categorization')

mongoose.connect(config.database,{ useNewUrlParser: config.useNewUrlParser })
conn = mongoose.connection;

const authCheck = (req,res,next) => {
    if(!req.user){
      console.log('user checked')
      res.redirect('/users/login')
    }
    else{
      next();
    }
}

//init gfs
let gfs;
conn.once('open', function(){
    //init stream
    gfs = Grid(conn.db, mongoose.mongo);
    //collection name
    gfs.collection('fs');
});

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+'.csv')
    }
  })
   
var upload = multer({ storage: storage })

// create storge object
// const storage = new GridFsStorage({
//     url: config.database,
//     file: (req, file) => {
//       return {
//         filename: req.body.sign_name + req.body.long + req.body.lat + '.jpg' 
//       }
//     }
//   });
// const upload = multer({ storage });
router.get('/test', function(req,res){
    res.render('test',{
            locations : [['Bondi Beach', -33.890542, 151.274856, 4],
                         ['Coogee Beach', -33.923036, 151.259052, 5],
                         ['Cronulla Beach', -34.028249, 151.157507, 3],
                         ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
                         ['Maroubra Beach', -33.950198, 151.259302, 1]
                        ]
    })
})

//add road sign
router.get('/add',authCheck,function(req,res){
    res.render('add_sign',{
        title : 'Add Sign'
    });
});

//add submit POST route
router.post('/add' ,authCheck, function(req,res){
    let signs = new rd_sign();
    signs.sign_name = req.body.sign_name;
    signs.long = req.body.long;
    signs.lat = req.body.lat;
    signs.head = req.body.head;
    signs.road = req.body.road;
    signs.areaCode = req.body.areaCode;
    signs.code = req.body.code;

    signs.save(function(err){
        if(err){
            console.log('submit error: ',err)
            return;
        }else{
            req.flash('success','Road Sign Added');
            res.redirect('/');
        }
    });  
});

//add image form
router.get('/add_image',authCheck, function(req,res){
    res.render('sign_image');
})

router.get('/change_image/:filename',authCheck, function(req,res){
    let file = {};
    file.filename =  req.params.filename;
    res.render('change_image',{
        file : file,
    })
})

//Deleteing files
router.delete('/change_image/:filename', function(req,res){
    gfs.remove({filename: req.params.filename , root: 'fs'}, function(err,gridstore){
        if(err){
            return res.status(404).json({err:err})
        }
        res.redirect('/image_upload/'+req.params.filename)
    })
})


//getting a single sign details
router.get('/:id',authCheck, function(req,res){
     rd_sign.findById(req.params.id, function(err,road_sign){
         let file = {};
         file.filename = road_sign.sign_name + road_sign.long + road_sign.lat + '.jpg';
         res.render('road_sign',{
             road_sign : road_sign,
             file : file,
         })
     })   
 })

router.get('/image/:filename',authCheck, function(req,res){
    gfs.files.findOne({filename: req.params.filename},function(err,file){
        //check if files
        if(!file || file.length ===0){
            return res.status(404).json({
                err: 'No file exist'
            })
        }
        //check if image
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/jpeg'){
            //read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }else{
            res.status(404).json({
                err : 'Not an image'
            });
        
      
        }
        
    })
})
  

//load edit form
router.get('/edit/:id',authCheck, function(req,res){
    rd_sign.findById(req.params.id, function(err,road_sign){
        res.render('edit_road_sign', {
            title : 'Edit Sign',
            road_sign : road_sign,
        });
        
    });

});


//posting the edit requests
router.post('/edit/:id', function(req,res){
    let signs = {};
    signs.sign_name = req.body.sign_name;
    signs.long = req.body.long;
    signs.lat = req.body.lat;
    signs.head = req.body.head;
    signs.road = req.body.road;
    signs.areaCode = req.body.areaCode;
    signs.code = req.body.code;

    let querry = {_id: req.params.id}

    rd_sign.updateOne(querry, signs, function(err){
        if(err){
            console.log('update error: ',err)
            return;
        }else{
            req.flash('success', 'Sign Updated');
            res.redirect('/');
        }
    });  
});

//deleting sign
router.delete('/:id', function(req,res){
    let query = {_id:req.params.id}

    rd_sign.deleteOne(query, function(err){
        if(err){
            console.log(err);
        }
        res.send('Success');
    });
});

router.get('/map/home',authCheck, function(req,res){
    var locations = [];
    function dataObj(lat,long){
        return [lat,long];
    }

    rd_sign.find({},async function(err,road_signs){
        if(err){
            console.log('querry error: ',err);
        }else{
            for(var i=0; i < road_signs.length; i++){
                locations[i] = await dataObj(road_signs[i].lat, road_signs[i].long)
            }  
            res.render('sign_map',{
                title : 'Road Signs',
                road_signs : road_signs,
                locations : [['Bondi Beach', -33.890542, 151.274856, 4],
                             ['Coogee Beach', -33.923036, 151.259052, 5],
                             ['Cronulla Beach', -34.028249, 151.157507, 3],
                             ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
                             ['Maroubra Beach', -33.950198, 151.259302, 1]
                            ]
            });
        }
    });
})



router.get('/map/:area',authCheck, function(req,res){
    let query = {area : req.params.area}
    rd_sign.find(query, async function(err,road_signs){
        if(err){
            console.log('query error: ',err);
        }else{
            res.render('road_sign_map',{
                title : "Road Signs of "+ req.params.area,
                road_signs : road_signs
            });
        }
    });
})

router.get('/upload/csv',authCheck, function(req,res){
    res.render('csv_upload');
})

router.post('/upload/csv',authCheck, upload.single('myFile'), function(req,res){
    const file = req.file
    if(!file){
        //req.flash('failureFlash', 'Upload a file');
        res.redirect('/roadsign/upload/csv')
    }else{
        csvtojson().fromFile('./uploads/'+file.filename).then(source => {
            source.forEach((entry) => {
                let sign_data = new rd_sign();
                sign_data.sign_name = entry.sign_name;
                sign_data.long = entry.longitude;
                sign_data.lat = entry.latitude;
                sign_data.head = entry.heading;
                sign_data.code = entry.image_code;
                sign_data.road = "none";
                sign_data.areaCode = categorization(req.body.latitude,req.body.longitude);
                console.log(sign_data)
                sign_data.save((err) => {
                    if(err){
                        console.log('error')
                        res.redirect('/roadsign/upload/csv')
                    }
                    else{
                        req.flash('success', 'Data Saved');
                        res.redirect('/')
                    }
                    
                })
            })
        })
    }
    
})
var locations = [];
function dataObj(lat,long){
    return [lat,long];
}

function getData(){
    rd_sign.find({}, async function(err,road_signs){
        if(err){
            console.log('querry error: ',err);
        }else{
            for(var i=0; i < road_signs.length; i++){
                locations[i] = await dataObj(road_signs[i].lat, road_signs[i].long)
            }    
        }
        console.log(locations)    
    });
    
} 

//getData()

module.exports = router;
