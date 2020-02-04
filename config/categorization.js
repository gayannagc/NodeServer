
function categorization(latitude,longitude){
    if(!(5.904059 < latitude < 10.065380) || !(79.563740 < longitude < 81.939274)){
        return console.error("sign not in sri lanka");
        
    }else{
        var y = Math.floor((latitude-5.904049)/(0.4161331));
        var x = Math.floor((longitude - 79.563740)/(0.21379806));
        return(String(x)+String(y))
    }
    
}

console.log(categorization(6.783866, 79.879982))

module.exports = categorization