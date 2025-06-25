// ===============================
// app.js — COMPLETE WORKING VERSION
// ===============================
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

// ✅ Load environment variables
dotenv.config();

// ✅ Create the app
const app = express();
app.use(cors());
app.use(express.json());

const WATSONX_API_KEY = process.env.WATSONX_API_KEY;
const WATSONX_URL = process.env.WATSONX_URL;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

app.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      process.env.WATSONX_URL,
      {
        model_id: "ibm/granite-13b-chat-v2",
        input: prompt,
        parameters: { max_new_tokens: 150 },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WATSONX_API_KEY}`
        },
      }
    );
    res.json({ reply: response.data.results[0]?.generated_text });
  } catch (error) {
    console.error("[WATSONX ERROR]", error.response?.data || error.message);
    res.status(500).json({ error: "Error connecting to WatsonX" }); // ✅ JSON error
  }
});


app.get("/air-quality", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).send({ error: "City is required" });
  }

  try {
    console.log("[DEBUG] OPENWEATHER_API_KEY:", OPENWEATHER_API_KEY);

    // 1️⃣ Get coordinates
    const geoResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );
    if (!geoResponse.data.length) {
      console.error("[ERROR] City not found");
      return res.status(404).send({ error: "City not found" });
    }

    const { lat, lon } = geoResponse.data[0];
    console.log(`[INFO] Fetched lat: ${lat}, lon: ${lon}`);

    // 2️⃣ Get air quality
    const airResponse = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
    );
    console.log("[INFO] Air Quality Response:", airResponse.data);
    res.json(airResponse.data.list[0]);
  } catch (error) {
    console.error("[AIR QUALITY ERROR]", error.response?.data || error.message);
    res.status(500).send({ error: "Error fetching air quality data" });
  }
});

// ✅ START SERVER
app.listen(3001, () => {
  console.log("✅ Backend running at http://localhost:3001");
});
