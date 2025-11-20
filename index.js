import express from "express";
import dotenv from "dotenv";
import login from "./route/login.js";
import notes from "./route/note.js";
import cors from "cors";
import { specs, swaggerUi } from "./swagger.js";
import router from "./route/login.js";

const app = express();
dotenv.config();
app.use(express.json());



const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

app.use("/api", login);
app.use("/soleil", notes);

const users = [{ id: 1, name: "dd" }];

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/users", (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
});

export default app;