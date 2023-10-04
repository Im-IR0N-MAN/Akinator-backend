const express = require("express");
const { Aki } = require("aki-api");
const path = require("path");
var cookieParser = require("cookie-parser");
const { v4: uuid } = require("uuid");
const region = "en";

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

const cors = require("cors");

var userlist = [];
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.get("/", (req, res) => {res.send('yo')});

app.get("/start", async (req, res) => {
  try {
    const childMode = true;
    const user = {
      userid: uuid(),
      data: new Aki({ region, childMode }),
      ctime: Date.now(),
    };
    userlist.push(user);

    res.cookie("uid", user.userid);
    console.log(user.userid);
    await user.data.start();
    const question = user.data.question;
    console.log("worked");
    console.log(user.data);
    console.log("executing");
    res.json({ next: "que", question });
  } catch (error) {
    console.log(error);
  }
  
});

app.get("/ans", async (req, res) => {
  try {
      const uid = req.cookies.uid;
      console.log(uid);
      const user = userlist.find((u) => u.userid == uid);

      await user.data.step(req.query.a);
      const question = user.data.question;

      if (user.data.progress >= 90) {
        await user.data.win();
        const guess = user.data.answers[0];
        userlist = userlist.filter((u) => u != user);
        return res.send({ next: "ans", guess });
      }
      return res.send({ next: "que", question });
  } catch (error) {
    console.log(error);
  }


});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});