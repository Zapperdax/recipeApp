const express = require('express');
const app = express();
require('./db/mongoose');
const recipeRoute = require('./routes/recipeRoute');
const adminRoute = require('./routes/adminRoute');
const cors = require('cors');

const port = process.env.PORT || 2533;

app.use(cors());
app.use(express.json());
app.use(recipeRoute);
app.use(adminRoute);

app.listen(port, ()=> {
    console.log('Listening To Port : ' + port);
})