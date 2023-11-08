const express=require('express')
const cors=require('cors')
require('dotenv').config()
const app=express()
const port=process.env.PORT || 5000 ;


// middleware
app.use(cors())
app.use(express.json())


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
    // const bidsCollection=client.db('categorydb').collection('bids')

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
       const result=await categoryCollection.find().toArray();
       console.log(result)
       res.send(result)
    })
    
    app.post('/bids',async(req,res)=>{
       const bid=req.body;
       const result=await categoryCollection.insertOne(bid);
       res.send(result);
    })

    app.get('/bids/:userEmail',async(req,res)=>{
      const userEmail=req.params.userEmail;
      const query={applicant:userEmail}
      const result=await categoryCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/bidReq/:userEmail',async(req,res)=>{
       const userEmail=req.params.userEmail
       const query={employer:userEmail}
       const result=await categoryCollection.find(query).toArray()
       res.send(result)
    })
    app.get('/postedJobs/:userEmail',async(req,res)=>{
       const userEmail=req.params.userEmail
       const query={employer:userEmail}
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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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