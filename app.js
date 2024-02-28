// codefree/app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

mongoose.connect('mongodb://localhost:27017/codefree', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

app.use(session({
    secret: '0000',
    resave: false,
    saveUninitialized: false
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));



app.get('/editor', (req, res) => {
    res.sendFile(__dirname + '/templates/editor.html');
});

app.post('/run_code', (req, res) => {
    const code = req.body.code;
    try {
        eval(code);
        res.send('Code executed successfully');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});


app.get('/profile', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.redirect('/login');
        }
        const userId = req.session.userId;
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).send('User not found');
        }
        res.send(currentUser.toObject());
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.send('Username already exists. Choose a different one.');
        }
        const newUser = new User({ username, email, password });
        await newUser.save();
        return res.send(`
            <p>Registration successful!</p>
            <a href="/editor"><button>Press to move next page</button></a>
        `);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.send('Invalid username or password.');
        }
        req.session.userId = user._id;
        return res.send(`
            <p>Login successful!</p>
            <a href="/editor"><button>Press to move next page</button></a>
        `);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/templates/index.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/templates/register.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/templates/login.html');
});

app.get('/editor', (req, res) => {
    res.sendFile(__dirname + '/templates/editor.html');
});

app.get('/education', (req, res) => {
    res.sendFile(__dirname + '/templates/education.html');
});

app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/templates/about.html');
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

