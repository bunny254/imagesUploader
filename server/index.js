require("dotenv").config();
const express = require('express');
const cors = require("cors");
const multer  = require('multer')
const { memoryStorage } = require('multer');
const { uploadToS3, getUserPresignedUrls } = require('./s3.js');


const app = express();
const port= process.env.PORT || 5000

const storage = memoryStorage()
const upload = multer({storage})


app.use(cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.get('/',(req,res)=> res.send("Success"))

app.post('/images', upload.single("image"), (req,res)=>{
    const {file} = req;
    const userId = req.headers["x-user-id"];

    console.log(file);

    if(!file || !userId) return res.status(400).json({message:"Bad request"})

    const {error, key }= uploadToS3({file, userId})
    if(error) return res.status(500).json({message: error.message});
    
    return res.status(201).json({key});
});

app.get('/images', async (req, res)=>{
    const userId = req.headers['x-user-id'];

    if(!userId) return res.status(400).json({message:"Bad request"})

    const {error, presignedUrls} =await getUserPresignedUrls(userId);
    if(error) return res.status(400).json({message:error.message});
    return res.json(presignedUrls);
})



app.listen(port,()=>{
    console.log(`Server running on ${port} successfully!`);
})