import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { auth, onAuthStateChanged } from "../firebase";
import Navbar from "../Navbar/Navbar";

const Home = () => {
  const [userDetails, setUserDetails] = useState({ 
    username: localStorage.getItem("username") || null, 
    avatarUrl: localStorage.getItem("avatarUrl") || "/default-avatar.png" 
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [thoughtOfTheDay, setThoughtOfTheDay] = useState("");
  const [typedText, setTypedText] = useState("");
  const canvasRef = useRef(null);

  const thoughts = [
    "Take a deep breath. You are doing your best!",
    "Every day is a fresh start.",
    "You are capable of amazing things.",
    "Believe in yourself and your dreams.",
    "Progress, not perfection, matters most."
  ];

  // Listen to auth state changes and update local storage accordingly.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const username = user.displayName || user.email;
        const avatarUrl = user.photoURL || "/default-avatar.png";
        setUserDetails({ username, avatarUrl });
        localStorage.setItem("username", username);
        localStorage.setItem("avatarUrl", avatarUrl);
      } else {
        setUserDetails({ username: null, avatarUrl: "/default-avatar.png" });
        localStorage.removeItem("username");
        localStorage.removeItem("avatarUrl");
      }
    });
    return () => unsubscribe();
  }, []);

  // Set the "Thought of the Day"
  useEffect(() => {
    const index = new Date().getDate() % thoughts.length;
    setThoughtOfTheDay(thoughts[index]);
  }, []);

  // Animate the welcome message with the user's username.
  useEffect(() => {
    if (!userDetails.username) {
      setTypedText("");
      return;
    }
    const welcomeText = `EWelcome, ${userDetails.username}!`;
    let index = 0;
    setTypedText("");
    const intervalId = setInterval(() => {
      setTypedText((prev) => prev + welcomeText.charAt(index));
      index++;
      if (index >= welcomeText.length) {
        clearInterval(intervalId);
      }
    }, 100);
    return () => clearInterval(intervalId);
  }, [userDetails.username]);

  // Initialize the scratch canvas effect.
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 300;
    canvas.height = 100;
    
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-out";
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Scratch Me!", canvas.width / 2, canvas.height / 2);

    const handleScratch = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
      checkScratchProgress(ctx, canvas);
    };

    canvas.addEventListener("mousemove", handleScratch);
    return () => canvas.removeEventListener("mousemove", handleScratch);
  }, []);

  // Check if the canvas is scratched enough to reveal the daily thought.
  const checkScratchProgress = (ctx, canvas) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let clearedPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) clearedPixels++;
    }
    if (clearedPixels / (canvas.width * canvas.height) > 0.5) {
      setScratched(true);
    }
  };

  return (
    <div style={{ position: "relative", padding: "20px" }}>
      <Navbar 
        username={userDetails.username} 
        avatarUrl={userDetails.avatarUrl} 
        toggleDropdown={() => setDropdownOpen(!dropdownOpen)} 
        dropdownOpen={dropdownOpen} 
        handleLogout={() => console.log("Logging out...")} 
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center"
        }}
      >
        {/* Welcome message section with avatar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)"
          }}
        >
          <img 
            src={userDetails.avatarUrl} 
            alt="User Avatar" 
            style={{
              width: "60px", 
              height: "60px", 
              borderRadius: "50%", 
              border: "2px solid #333"
            }} 
          />
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>{typedText}</h2>
        </motion.div>

        {/* Scratch card for daily motivation */}
        <div style={{
          position: "relative",
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "10px",
          textAlign: "center",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          width: "300px"
        }}>
          {!scratched && (
            <canvas 
              ref={canvasRef} 
              style={{ 
                position: "absolute", 
                top: 0, 
                left: 0, 
                width: "100%", 
                height: "100%", 
                cursor: "pointer" 
              }}
            ></canvas>
          )}
          {scratched && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
              <h3 style={{ fontSize: "18px", color: "#333" }}>Daily Motivation 🌿</h3>
              <p style={{ fontSize: "16px", color: "#555", fontWeight: "500" }}>{thoughtOfTheDay}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
