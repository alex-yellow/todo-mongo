const express = require('express');
const exphbs = require('express-handlebars');
const mongodb = require('mongodb');
const cookieparser = require('cookie-parser');
const expsession = require('express-session');
const { ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const secret = 'qwerty';
app.use(cookieparser(secret));
app.use(expsession({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 2000 
    }
}));

const mongoclient = new mongodb.MongoClient('mongodb://localhost:27017/');

async function Start() {
    try {
        await mongoclient.connect();
        console.log('connection success');
        const db = mongoclient.db('todos');
        const coll = db.collection('tasks');

        app.get('/', async function (req, res) {
            const tasks = await coll.find().toArray();
            try {
                res.render('index', { title: 'Home', tasks, add: req.session.add, edit: req.session.edit, delete:req.session.delete });
            } catch (error) {
                res.render('error', { title: 'Tasks not found' });
            }
        });

        app.get('/tasks/:id', async function (req, res) {
            const id = req.params.id;

            // Проверяем, соответствует ли id формату ObjectId
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

            if (isValidObjectId) {
                try {
                    const objId = new ObjectId(id);

                    const task = await coll.findOne({ _id: objId });

                    if (task) {
                        res.render('task', { title: `Task ${id}`, task });
                    } else {
                        res.render('error', { title: 'Task not found' });
                    }
                } catch (error) {
                    console.error(error);
                    res.render('error', { title: 'Invalid ObjectId' });
                }
            } else {
                res.render('error', { title: 'Invalid ObjectId' });
            }
        });

        app.get('/add', function (req, res) {
            try {
                res.render('add');
            } catch (error) {
                res.render('error', { title: 'Page not found' });
            }
        });

        app.post('/add', async function (req, res) {
            try {
                const task = {
                    title: req.body.title,
                    completed: false
                }
                await coll.insertOne(task);
                req.session.add = `Task <b>${task.title}</b> added success`;     
                res.redirect('/');
            } catch (error) {
                res.render('error', { title: 'Add not success' });
            }
        });

        app.get('/edit/:id', async function (req, res) {
            const id = req.params.id;

            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

            if (isValidObjectId) {
                try {
                    const objId = new ObjectId(id);

                    const task = await coll.findOne({ _id: objId });

                    if (task) {
                        res.render('edit', { title: `Task ${id}`, task });
                    } else {
                        res.render('error', { title: 'Task not found' });
                    }
                } catch (error) {
                    console.error(error);
                    res.render('error', { title: 'Invalid ObjectId' });
                }
            } else {
                res.render('error', { title: 'Invalid ObjectId' });
            }
        });

        app.post('/edit/:id', async function(req, res){
            const id = req.params.id;
        
            try {
                const objId = new ObjectId(id);
                const task = req.body;
                
                await coll.updateOne({ _id: objId }, { $set: { title: task.title } });
        
                req.session.edit = `Task ${task.title} edit success`;
                res.redirect('/');
            } catch (error) {
                console.error(error);
                res.render('error', { title: 'Edit not success' });
            }
        });

        app.post('/delete', async function(req, res){
            let id = req.body.id;
        
            try {
                const objId = new ObjectId(id);
                const task = await coll.findOne({ _id: objId });
                await coll.deleteOne({_id: objId});
                req.session.delete = `Task ${task.title} delete success`;
                res.redirect('/');
            } catch (error) {
                console.error(error);
                res.render('error', { title: 'Delete not success' });
            }
        });

        app.use(function (req, res) {
            res.status(404).render('error404', { title: 'Page not found' });
        });
        app.listen(PORT, function () {
            console.log('Server is running on port', PORT);
        });
    } catch (error) {
        console.log('connection error', error);
    }
}

Start();