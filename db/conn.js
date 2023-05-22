const mongoose=require('mongoose')

const DB="mongodb+srv://abimeeraperumal10:Jj2sJvpQvSegG4m8@nishitha.8jv94cv.mongodb.net/"
mongoose.set('strictQuery', true);
mongoose.connect(DB,{
    useUnifiedTopology: true,
    
    useNewUrlParser: true,}).then(()=>console.log("Connected")).catch((error)=>console.log(error));

