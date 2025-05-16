var express = require('express');
var router = express.Router();
var userModel = require('../views/models/userModel');
var projectModel = require('../views/models/projectModel');
var bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken"); 
require("dotenv").config(); 

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Signup route
router.post("/signup", async (req, res) => {
  const { username, name, email, password } = req.body;
  const emailCon = await userModel.findOne({ email });

  if (emailCon) {
    return res.json({ success: false, message: "Email already exists.." });
  }

  const hashpassword = await bcrypt.hash(password, 10);

  await userModel.create({
    username,
    name,
    email,
    password: hashpassword
  });

  return res.json({ success: true, message: "User created successfully" });
});

const secret = "secret"

// Login route

router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email: email });

  if (user) {
    bcrypt.compare(password, user.password, function (err, isMatch) {
      if (err) {
        return res.json({ success: false, message: "An error occurred", error: err });
      }
      if (isMatch) {
        let token = jwt.sign({ email: user.email, userId: user._id }, secret);
        return res.json({ success: true, message: "User logged in successfully", token: token, userId: user._id });
      } else {
        return res.json({ success: false, message: "Invalid email or password" });
      }
    });
  } else {
    return res.json({ success: false, message: "User not found!" });
  }
});

router.post("/getUserDetails",async (req,res)=>{
  const { userId } = req.body;
  console.log(req.body)
  let user = await userModel.findOne({_id:userId});
  if (user){
    return res.json({success:true, message:"User details fetched successfully" , user:user})
  }
  else{
    return res.json({success:false,message:"User not found"})
  }
})


router.post("/createProject", async (req, res) => {
  const { userId, title } = req.body;

  try {
    let user = await userModel.findOne({_id:userId}); 

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const project = await projectModel.create({
      title,
      createdBy: userId
    });

    return res.json({
      success: true,
      message: "Project created successfully",
      projectID: project._id
    });
  } catch (err) {
    console.error("Error in /createProject:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/getProjects", async (req,res)=>{
  let {userId} = req.body
  let user = await userModel.findOne({_id:userId})
  if(user){
    let project = await projectModel.find({ createdBy: userId });
    return res.json({success:true,message:"Projects fetched successfully" , project:project})
  }
  else{
    return res.json({success:false , message:"User not found"})
  }
})


router.post("/deleteProject", async (req,res)=>{
  let {userID , projectID} = req.body
  console.log("Received delete request:", req.body);
  let user  = await userModel.findOne({_id:userID})
  if(user){
    let project = await projectModel.findOneAndDelete({_id:projectID})
    return res.json({success:true,message:"Project deleted successfully"})
  }
  else{
    return res.json({success:false,message:"user not found"})
  }
})


router.post("/getProjectCode", async (req, res) => {
  let {userId,projId} = req.body;
  let user = await userModel.findOne({ _id: userId });
  if (user) {
    let project = await projectModel.findOne({ _id: projId });
    return res.json({ success: true, message: "Project fetched successfully", project: project });
  }
  else{
    return res.json({ success: false, message: "User not found!" });
  }
});

router.post("/updateProject", async (req, res) => {
  let { userId, htmlCode, cssCode, jsCode, projId } = req.body;
  let user = await userModel.findOne({ _id: userId });

  if (user) {
    let project = await projectModel.findOneAndUpdate(
      { _id: projId },
      { htmlCode: htmlCode, cssCode: cssCode, jsCode: jsCode },
      { new: true } 
    );

    if (project) {
      return res.json({ success: true, message: "Project updated successfully" });
    } else {
      return res.json({ success: false, message: "Project not found!" });
    }
  } else {
    return res.json({ success: false, message: "User not found!" });
  }
});




module.exports = router;
