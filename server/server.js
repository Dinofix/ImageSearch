const express = require("express");
require("dotenv").config();
const cors = require("cors");
const Joi = require("joi");
const fs = require("fs").promises;

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = ["http://localhost:5173", "http://example.com"];

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

const filePath = process.env.USERDATA_FILE_PATH || "./userdata.json";

const favoriteImageSchema = Joi.object({
  user: Joi.string().required(),
  title: Joi.string().required(),
  byteSize: Joi.number().required(),
  url: Joi.string().uri().required(),
});

// Validation middleware
const validateFavoriteImage = (req, res, next) => {
  const { error } = favoriteImageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
};

app.post("/favorite", validateFavoriteImage, async (req, res, next) => {
  try {
    let userData = await readUserData(filePath);
    const userIndex = userData.findIndex((user) => user.user === req.body.user);
    const { user, ...favoriteImageData } = req.body;

    if (userIndex === -1) {
      userData.push({
        user: req.body.user,
        favoriteImages: [favoriteImageData],
      });
    } else {
      userData[userIndex].favoriteImages.push(favoriteImageData);
    }

    await fs.writeFile(filePath, JSON.stringify(userData, null, 2));
    res.status(201).json({ message: "Favorite image saved successfully" });
  } catch (err) {
    next(err);
  }
});

app.get("/favorites/:user", async (req, res, next) => {
  try {
    const userData = await readUserData(filePath);
    const user = userData.find((user) => user.user === req.params.user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.favoriteImages);
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

app.listen(port, () => console.log(`Server is up and running on port ${port}`));

async function readUserData(file) {
  try {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("File not found. Creating a new file.");
      await fs.writeFile(file, JSON.stringify([]));
      return [];
    } else {
      throw err;
    }
  }
}
