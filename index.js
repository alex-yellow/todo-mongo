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

app.listen(PORT, function(){
    console.log('Server is running on port', PORT);
});
