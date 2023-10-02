const express = require('express');
const exphbs = require('express-handlebars');
const mongodb = require('mongodb');

const app = express();
const PORT = 3000;
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

const mongoclient = new mongodb.MongoClient('mongodb://localhost:27017/');

async function Start(){
    try {
        await mongoclient.connect();
        console.log('connection success');
        const db = mongoclient.db('todos');
        const coll = db.collection('tasks');
        try {
            app.get('/', async function(req, res){
                const tasks = await coll.find().toArray();
                res.render('index', {title: 'Home', tasks});
            });
        } catch (error) {
            console.log('error');
        }
        app.listen(PORT, function(){
            console.log('Server is running on port', PORT);
        });
    } catch (error) {
        console.log('connection error', error);
    }
}

Start();