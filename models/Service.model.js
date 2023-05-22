const mongoose = require("mongoose");


const CRMserviceSchema = mongoose.Schema({
    Createrdby:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    Description:
    {
        type: String,
        required: true,
    },
   Status:
    {
        type: String,
        required: true,
    },
    title:{
        type: String,
        required: true,
    }

});

const Servicemodel= new mongoose.model("LeadModel", CRMserviceSchema);


module.exports = Servicemodel;