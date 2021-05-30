'use strict';

const express=require('express');
const superagent=require('superagent');
const methodOverride=require('method-override');
const pg=require('pg');
const cors=require('cors');


require('dotenv').config();
const PORT=process.env.PORT;


const app=express();
const client=new pg.Client(process.env.DATABASE_URL);

app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));
app.use(methodOverride('_method'));
app.set('view engine','ejs');
app.use(cors());
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get('/',homeHandler)
app.post('/result',searchHandler)
app.get('/search',search2Handler)



app.post('/mylist',myListHandler)
app.get('/mylist',myList2Handler)


app.get('/details/:id',detailsHandler)
app.put('/details/:id',updateHandler)
app.delete('/details/:id',deleteHandler)


app.post('/',createHandler)
app.get('/',create2Handler)
function createHandler (req,res){
    console.log(req.body);
    const {title,company,location,url,description}=req.body;
    let sql=`INSERT INTO sunday (title,company,location,url,description) VALUES ($1,$2,$3,$4,$5)`
    let safeValues=[title,company,location,url,description]
    client.query(sql,safeValues).then(()=>{
        res.redirect('/')
    })

}

function create2Handler(req,res){
    let sql=`SELECT * FROM sunday`
    client.query(sql).then(x=>{
        console.log(x.rows);
        res.render('index',{y:x.rows,cond:1})
    })

}

function homeHandler (req,res){
   let url='https://jobs.github.com/positions.json?location=usa';
   superagent.get(url).then(x=>{
    //   console.log(x.body);
    //   let y=x.body.map(Object=>new Job(Object))

   
     
      res.render('index',{y:x.body,cond:0})
   })
}
function search2Handler(req,res){
    res.render('search')
 }

function searchHandler(req,res){
   let search=req.body.description;
   let url=`https://jobs.github.com/positions.json?description=${search}&location=usa`
   superagent.get(url).then(x=>{
    // console.log(x.body);

    res.render('results',{y:x.body})
    
 })

}
function myListHandler(req,res){
    const {title,company,location,url,description}=req.body;
    let sql=`INSERT INTO sunday (title,company,location,url,description) VALUES ($1,$2,$3,$4,$5)`
    let safeValues=[title,company,location,url,description]
    client.query(sql,safeValues).then(()=>{
        res.redirect('/mylist')
    })
}
function myList2Handler(req,res){
    let sql=`SELECT * FROM sunday`
    client.query(sql).then(x=>{
        console.log(x.rows);
        let count=x.rows.length
        res.render('mylist',{y:x.rows,count:count})
    })

}

function detailsHandler(req,res){
    let id =req.params.id;
    let sql=`SELECT * FROM sunday WHERE id=${id}`
    client.query(sql).then(x=>{
        // console.log(x.rows);
        res.render('details',{y:x.rows})
    })

}

function updateHandler(req,res){
    const {title,company,location,url,description}=req.body;
    let id =req.params.id;
    let sql=`UPDATE sunday SET title=$1,company=$2,location=$3,url=$4,description=$5 WHERE id=${id}`
    let safeValues=[title,company,location,url,description]
    client.query(sql,safeValues).then(()=>{
        res.redirect(`/details/${id}`)
    })
}
function deleteHandler(req,res){
    
    let id =req.params.id;
    let sql=`DELETE FROM sunday WHERE id=${id}`

    client.query(sql).then(()=>{
        res.redirect('/mylist')
    })
}



// function Job(jobInfo){
//     this.title=jobInfo.title
//     this.company=jobInfo.company
//     this.location=jobInfo.location
//     this.url=jobInfo.url
// }




client.connect().then(()=>{
    app.listen(PORT,()=>console.log(`i'm using port ${PORT}`))
})