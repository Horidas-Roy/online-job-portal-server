const express=require('express')
const cors=require('cors')
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')
require('dotenv').config()
const app=express()
const port=process.env.PORT || 5000 ;


// middleware
app.use(cors({
   origin: [
    'http://localhost:5173',
    'https://online-job-portal-9c2d1.web.app',
    'https://online-job-portal-9c2d1.firebaseapp.com'
  ],
   credentials:true,
}))
app.use(express.json())
app.use(cookieParser())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wcearye.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const categoryCollection=client.db('categorydb').collection('categoryItem')
    const bidsCollection=client.db('categorydb').collection('bids')
    

  //  auth related api

   app.post('/jwt',async(req,res)=>{
        try{
          const user=req.body;
        console.log('user token:',user)
        const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
        res.cookie('token',token,{
           httpOnly:true,
           secure:process.env.NODE_ENV === 'production',
           sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })
        res.send({success:true})
        }catch(error){
          res.send({
            status:true,
            error:error.message
          })
        }
   })
    
   app.post('/logout',async(req,res)=>{
       const user=req.body;
       console.log('logOUt user',user)
       res.clearCookie('token',{ 
        maxAge: 0,
        secure:process.env.NODE_ENV === 'production' ? true : false,
        sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })
      .send({success:true})
   })

    // category related api
    app.get('/category',async(req,res)=>{
         const result=await categoryCollection.find().toArray()
         res.send(result)
    })

    app.get('/category/:categoryName',async(req,res)=>{
         const category=req.params.categoryName;
         const query={category:category}
         const result=await categoryCollection.find(query).toArray()
         res.send(result)
    })

    app.get('/jobs/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)}
        const result=await categoryCollection.findOne(query)
        res.send(result)
    })

    // bids related api

    app.get('/bids',async(req,res)=>{
       const result=await bidsCollection.find().toArray();
       console.log(result)
       res.send(result)
    })
    
    app.post('/bids',async(req,res)=>{
       const bid=req.body;
       const result=await bidsCollection.insertOne(bid);
       res.send(result);
    })

    app.get('/bids/:userEmail',async(req,res)=>{
      const userEmail=req.params.userEmail;
      const query={applicant:userEmail}
      const result=await bidsCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/bidReq/:userEmail',async(req,res)=>{
       const userEmail=req.params.userEmail
       const query={employer:userEmail}
       const result=await bidsCollection.find(query).toArray()
       res.send(result)
    })
    app.get('/postedJobs',async(req,res)=>{
       const userEmail=req.query?.email
       console.log(userEmail)
       let query={}
       if(userEmail){
          query = { employer : userEmail}
       }
      //  const query={employer:userEmail}
      // console.log(query)
       const result=await categoryCollection.find(query).toArray()
       res.send(result)
    })
    // add job page related api

    app.post('/addJob',async(req,res)=>{
       const job=req.body;
       console.log(job);
       const result=await categoryCollection.insertOne(job)
       res.send(result)
    })

    app.put('/updateJob/:id',async(req,res)=>{
        const id=req.params.id;
        const filter={_id: new ObjectId(id)}
        const updateJob=req.body;
        console.log('update',id,updateJob)
        const options={ upsert:true }
        const job={
          $set:{
            employer:updateJob.employer,
            job_title:updateJob.job_title,
            category:updateJob.category,
            minimum_price:updateJob.minimum_price,
            maximum_price:updateJob.maximum_price,
            icon:updateJob.icon,
            description:updateJob.description,
            
          }
        }
        const result=await categoryCollection.updateOne(filter,job,options)
        res.send(result);
    })

    app.patch('/status/:id',async(req,res)=>{
          const id=req.params.id;
          const UpdateStatus=req.body;
          const filter={_id :new ObjectId(id)}
          // const options={upsert:true}
          
          const status={
            $set:{
              status:UpdateStatus.status
            }
          }
          const result=await bidsCollection.updateOne(filter,status)
          console.log(result)
          res.send(result)
    })
    

    app.delete('/deleteJob/:id',async(req,res)=>{
        const id =req.params.id;
        console.log("delete id",id)
        const query={_id : new ObjectId(id)}
        const result=await categoryCollection.deleteOne(query)
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',async(req,res)=>{
    res.send("Online job portal is running")
})


app.listen(port,()=>{
    console.log(`Online Job Portal listening on port: `,port)
})