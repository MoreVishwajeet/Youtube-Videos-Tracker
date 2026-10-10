const express = require("express");
const app = express();

require("dotenv").config();
const apiKey = process.env.YOUTUBE_API_KEY;

const cors = require("cors");

const db = require("./database/database");
//routes
const authRoutes = require("./routes/auth");
const playlistRoute = require("./routes/playlist")

app.use(cors());
app.use(express.json()); //runs : new request arrives





app.use("/", playlistRoute);
app.use("/auth", authRoutes);





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is listening on port : ${PORT}`));