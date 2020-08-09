//Express server handling

//Import node modules
var express = require('express');
var app = express();
var fs = require("fs");

//Get the path of the server and host a static
var path = require('path');
const dir = path.join(__dirname, 'public');
app.use(express.static(dir));

console.log("Static directory setup at: " + dir);

//Send the html file
app.get('/', function (req, res) {
    res.sendfile("webpage/index.html");
});

//Send the game file
app.get('/js', function (req, res) {
    const page = fs.readFileSync("main.js", 'utf8');
    res.send(page);
});

//Get the objects (In JS form)
app.get('/objjs', function (req, res) {
    const page = fs.readFileSync("objects.js", 'utf8');
    res.send(page);
});

//Standard Algoritims
app.get('/algo', function (req, res) {
    const page = fs.readFileSync("standardalgos.js", 'utf8');
    res.send(page);
});

//Send the styling script - INVALID
app.get('/css.css', function (req, res) {
    console.log("css");
    const page = fs.readFileSync("public/style.css", 'utf8');
    res.send(page);
});

app.get('/file', function (req, res) {
    res.sendfile('public/files/'+req.query.name + '.txt');
});

//Host to port 8000
app.listen(8000, function () {
    console.log('Listening on port 8000');
    console.log('Server Hosted at localhost:8000');
});