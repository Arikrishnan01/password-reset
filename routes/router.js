const express=require('express');
// const app = express();
const router = new express.Router();
const userdb=require('../models/useSchema');
const  usermodel=require('../models/User.model');
const bcrypt = require("bcrypt");
const authenticate = require("../middleware/authenticate");
const nodemailer = require("nodemailer");
const jwt  = require("jsonwebtoken");


const keysecret = "ijhhjbnkihhgckopewcvpmieoqepidc"


// email config

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"nishithaabi1628@gmail.com",
        pass:"htwmdtevuhoflkyq"
    }
}) 



//for user registration
router.post("/register", async (req, res) => {
    
    const { fname, email, password, cpassword } = req.body;

    if (!fname || !email || !password || !cpassword) {
        res.status(422).json({ error: "fill all the details" })
    }

    try {

        const preuser = await userdb.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This Email is Already Exist" })
        } else if (password !== cpassword) {
            res.status(422).json({ error: "Password and Confirm Password Not Match" })
        } else {
            const finalUser = new userdb({
                fname, email, password, cpassword
            });

            // here password hasing

            const storeData = await finalUser.save();

            // console.log(storeData);
            res.status(201).json({ status: 201, storeData })
        }

    } catch (error) {
        res.status(422).json(error);
        console.log("catch block error");
    }

});


// user login

router.post("/login", async (req, res) => {
    // console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(422).json({ error: "fill all the details" })
    }

    try {
       const userValid = await userdb.findOne({email:email});

        if(userValid){

            const isMatch = await bcrypt.compare(password,userValid.password);

            if(!isMatch){
                res.status(422).json({ error: "invalid details"})
            }else{

                // token generate
                const token = await userValid.generateAuthtoken();

                console.log(token)

                // cookiegenerate
                res.cookie("usercookie",token,{
                    expires:new Date(Date.now()+9000000),
                    httpOnly:true
                });

                const result = {
                    userValid,
                    token
                }
                res.status(201).json({status:201,result})
            }
        }

    } catch (error) {
        res.status(401).json(error);
        console.log("catch block");
    }
});


// user valid(we use middle ware)
router.get("/validuser",authenticate,async(req,res)=>{
    try {
        const ValidUserOne = await userdb.findOne({_id:req.userId});
        res.status(201).json({status:201,ValidUserOne});
    } catch (error) {
        res.status(401).json({status:401,error});
    }
});

//send email link for reset password
router.post("/sendpasswordlink",async(req, res)=>
{
    console.log(req.body);

    const {email} = req.body;

    if(!email){
        res.status(401).json({status:401,message:"Enter Your Email"})
    }

    try {
        const userfind = await userdb.findOne({email:email});
        // console.log(userfind);
        // token generate for reset password
        const token = jwt.sign({_id:userfind._id},keysecret,{
            expiresIn:"1d",
        });
        // console.log("tokens",token);


        const setusertoken = await userdb.findByIdAndUpdate({_id:userfind._id},{verifytoken:token},{new:true});

        console.log("setusertoken",setusertoken);

        if(setusertoken){
            const mailOptions = {
                from:"nishithaabi1628@gmail.com",
                to:email,
                subject:"Sending Email For password Reset",
                text:`This Link Valid For 2 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`
            }

            transporter.sendMail(mailOptions,(error,info)=>{
                if(error){
                    console.log("error",error);
                    res.status(401).json({status:401,message:"email not send"})
                }else{
                    console.log("Email sent",info.response);
                    res.status(201).json({status:201,message:"Email sent Succsfully"})
                }
            })

        }

    } catch (error) {
        res.status(401).json({status:401,message:"invalid user"})
    } 
})

// verify user for forgot password time

router.get("/forgotpassword/:id/:token",async(req,res)=>{
    const {id,token} = req.params;

    try {
        const validuser = await userdb.findOne({_id:id,verifytoken:token});
        
        const verifyToken = jwt.verify(token,keysecret);

        console.log(verifyToken)

        if(validuser && verifyToken._id){
            res.status(201).json({status:201,validuser})
        }else{
            res.status(401).json({status:401,message:"user not exist"})
        }

    } catch (error) {
        res.status(401).json({status:401,error})
    }
});



// change password

router.post("/:id/:token",async(req,res)=>{
    const {id,token} = req.params;

    const {password} = req.body;

    try {
        const validuser = await userdb.findOne({_id:id,verifytoken:token});
        
        const verifyToken = jwt.verify(token,keysecret);

        if(validuser && verifyToken._id){
            const newpassword = await bcrypt.hash(password,12);

            const setnewuserpass = await userdb.findByIdAndUpdate({_id:id},{password:newpassword});

            setnewuserpass.save();
            res.status(201).json({status:201,setnewuserpass})

        }else{
            res.status(401).json({status:401,message:"user not exist"})
        }
    } catch (error) {
        res.status(401).json({status:401,error})
    }
})

// Create an user by admin

// router.get("/CreateUserByAdmin/:id",(req,res)=>
// {
//     const {_id}=req.params;
//     usermodel.findById(_id)
//     .then((response)=>
//     {
//         if(response)
//         {
//             return res.status(200).json({
//                 message:"successfully fetched",
//                 response,
//             });
//         }
//         // else{
//         //     return res.status(200).json({
//         //         message: "",
//         //         response: {},
//         //       });
//         // }
//     }).catch((err)=>
//     {
//         return res.status(400).json({
//             error: err,
//           });
//     })
// });

// router.post("/CreateUserByAdmin/:id",async(req,res) => {
//     const id=req.body('id');
//     console.log(id);

//     const {Role,Name,Contact,email,password,Company} = req.body;

//     try {
//         const finduser= await usermodel.findOne({_id:ObjectId(id)});
//         console.log(finduser)
//         if(finduser.Role=="Administration")
//         {
            
//                 const newuser=new usermodel({
//                     Role:Role,
//                     Name:Name,
//                     Contact:Contact,
//                     email:email,
//                     password:password,
//                     Company:Company
//                 });
            
//              newuser.save();
            
//         }
//         else{ res.status(400).json({message:"user is not an admin"})}
       

//     } catch (e) { res.status(400).json(e)}

// })



router.post("/CreateUsersByAdmins/:id",async(req,res) => {
    // debugger;
    console.log("hello");
    // const {id}=req.params;
    // console.log(id)
    // const {Role,Name,Contact,email,password,Company} = req.body;
    // usermodel.findOne({_id:id}).then(user => {
    //     // debugger;
    //     try{
    //         if(user.Role=="Administration")
    //     {
    //         const newuser=new usermodel({
    //             Name:Name,
    //             email:email,
    //             password:password,
    //             Contact:Contact,
    //             Role:Role,
    //             Company:Company
    //         });
        
    //      newuser.save();
    //     }
    //     else{ res.status(400).json({message:"user is not an admin"})}
    //     }
    //     catch (e)
    //      { 
    //         res.json(e)
    //     }
    })
// });

// 

//  router.get("/CreateUsersByAdmins",async(req,res) => {

//         // debugger;
//         const {id}=req.params;
//         const {Role,Name,Contact,email,password,Company} = req.body;
//         usermodel.findOne({id:id}).then(user => {
//             // debugger;
//             try{
//                 if(user.Role=="Administration")
//             {
//                 const newuser=new usermodel({
//                     Name:Name,
//                     email:email,
//                     password:password,
//                     Contact:Contact,
//                     Role:Role,
//                     Company:Company
//                 });
            
//              newuser.save();
//             }
//             else{ res.status(400).json({message:"user is not an admin"})}
//             }
//             catch (e)
//              { 
//                 res.json(e)
//             }
//         })
//     });

router.post('/userAdmin/:id',async(req,res)=>
{
    // console.log(req.params);
})

router.post("/CreateUserByAdmin",async(req,res) => {
    
    // const id=req.body.id;
    // console.log(id);

    const {Role,Name,Contact,email,password,Company} = req.body;

    const newuser=new usermodel({
        Role:Role,
        Name:Name,
        Contact:Contact,
        email:email,
        password:password,
        Company:Company
    });
    newuser.save()
    .then((response) => {
        if (response._id) {
          return res.status(200).json({
            message: "User Created Successfully",
            data: response,
          });
        }
      })
      .catch((err) =>
        res.status(400).json({
          error: err,
        })
      );

     
})

module.exports = router;