const express=require('express');
const app=express();
const router = require('./routes/router');
const cookiParser = require("cookie-parser")
require("./db/conn");
const cors=require("cors");
const PORT=7000;




// app.get('/',(req,res)=>{}
//     res.status(200).json("server started");
// });

app.use(express.json());
app.use(cookiParser());
app.use(cors());
app.use(router)

app.listen(PORT,()=>
{

    console.log(`server startted running on port ${PORT}`);
});