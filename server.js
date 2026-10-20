require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

let connectionPromise;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add your MongoDB connection string.");
  }
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }
  await connectionPromise;
}

app.use("/api", async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/tasks", async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

app.post("/api/tasks", async (req, res, next) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) return res.status(400).json({ error: "Please enter a task." });
    if (title.length > 200) {
      return res.status(400).json({ error: "Tasks must be 200 characters or fewer." });
    }
    const task = await Task.create({ title });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/tasks", async (req, res, next) => {
  try {
    const { id, completed } = req.body;
    if (!mongoose.isValidObjectId(id) || typeof completed !== "boolean") {
      return res.status(400).json({ error: "A valid task and completion status are required." });
    }
    const task = await Task.findByIdAndUpdate(id, { completed }, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ error: "Task not found." });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/tasks", async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "A valid task is required." });
    }
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ error: "Task not found." });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: "Something went wrong. Check the server logs and try again." });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
}

module.exports = app;
