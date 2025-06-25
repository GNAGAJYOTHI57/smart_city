import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  // New method for fetching air quality
  const fetchAirQuality = async (city) => {
    try {
      const response = await axios.get(`http://localhost:3001/air-quality?city=${city}`);
      const data = response.data;
      const aqi = data.main.aqi;

      let quality;
      switch (aqi) {
        case 1:
          quality = "Good 🌳"; break;
        case 2:
          quality = "Fair 🍃"; break;
        case 3:
          quality = "Moderate 🌥️"; break;
        case 4:
          quality = "Poor 🌫️"; break;
        case 5:
          quality = "Very Poor ☠️"; break;
        default:
          quality = "Unknown";
      }

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `The air quality in ${city} is ${quality}. (AQI: ${aqi})`,
        },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "assistant", text: "Unable to fetch air quality." },
      ]);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    setChat((prev) => [...prev, { role: 'user', text: userInput }]);

    // Check if it's an air quality request
    if (userInput.toLowerCase().includes("air quality in")) {
      const city = userInput.toLowerCase().split("air quality in")[1]?.trim();
      if (city) {
        await fetchAirQuality(city);
        setLoading(false);
        setUserInput('');
        return;
      }
    }

    try {
      const response = await axios.post('http://localhost:3001/chat', {
        prompt: userInput,
      });
      setChat((prev) => [
        ...prev,
        { role: 'assistant', text: response.data.reply },
      ]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error getting response.' },
      ]);
    } finally {
      setLoading(false);
      setUserInput('');
    }
  };
  
  return (
    <div className="app">
      <h1>🌳 Sustainable Smart City Assistant</h1>
      <div className="chat-box">
        {chat.map((c, index) => (
          <div key={index} className={c.role}>
            <p>{c.text}</p>
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={userInput}
          placeholder="Ask about sustainability..."
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;
