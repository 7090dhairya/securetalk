let express = require("express")
let app = express()
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const Message = require("./models/message");

app.get("/messages/:userId", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const myId = req.session.userId;
  const otherId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: myId, receiver: otherId },
      { sender: otherId, receiver: myId },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
console.log("Serving static from:", path.join(__dirname, "public"));

const sessionMiddleware = session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60,
  },
});

app.use(sessionMiddleware);




app.use(express.json())
app.use(express.urlencoded({extended :true}))



app.get("/",(req,res)=>{
    res.send("this is my message")
})

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

app.get("/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json({ message: "Welcome to dashboard" });
});





module.exports = { app, sessionMiddleware };