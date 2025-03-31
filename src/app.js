const express = require('express');

const app = express();

app.use("/login", (req, res) => {
    res.send("Login handler");
});

app.use("/signup", (req, res) => {
    res.send("Signup handler");;
});

app.use("/", (req, res) => {
    res.send("/ handler");
});


app.listen(7777, () => {
    console.log("Server is running successfully !");
});
