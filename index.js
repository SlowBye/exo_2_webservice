import express from "express";
import dotenv from "dotenv";
import login from "./route/login.js";
import notes from "./route/note.js"

const app = express();
dotenv.config();
app.use(express.json());

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

app.use("/api", login);
app.use("/soleil", notes);

export default app;