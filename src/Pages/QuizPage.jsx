import React, { useState } from "react";
import { Button, Box, Typography, Grid, TextField } from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "../Navbar/Navbar";

const questions = [
  { question: "What is your Gender?", type: "options", options: ["Male", "Female"] },
  { question: "What is your Age?", type: "numeric" },
  { question: "Academic pressure (1-5)?", type: "options", options: ["1", "2", "3", "4", "5"] },
  { question: "Study satisfaction (1-5)?", type: "options", options: ["1", "2", "3", "4", "5"] },
  { question: "Sleep duration?", type: "options", options: ["<5hr", "5-6hr", ">8hr", "<8hr"] },
  { question: "Dietary habits?", type: "options", options: ["Moderate", "Healthy", "Unhealthy"] },
  { question: "Suicidal thoughts?", type: "options", options: ["Yes", "No"] },
  { question: "Study hours?", type: "numeric" },
  { question: "Financial stress (1-5)?", type: "options", options: ["1", "2", "3", "4", "5"] },
  { question: "Family history of mental illness?", type: "options", options: ["Yes", "No"] },
];

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);

  const handleAnswerClick = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNextQuestion = () => {
    if (!answers[currentQuestion]) return;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <>
      <Navbar />

      <Box
        sx={{
          marginTop: "64px",
          padding: "20px",
          minHeight: "calc(100vh - 64px)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,rgb(208, 212, 214),rgb(130, 126, 184), #2c5364)",
        }}
      >
        {!quizFinished ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              background: "transparent",  // Transparent background
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 0 20px #00e5ff",  // Neon effect
              maxWidth: "600px",
              width: "100%",
              border: "2px solid #00e5ff",  // Neon border effect
              textAlign: "center",
              color: "#000",  // Change text color to black
              animation: "pulseGlow 2s infinite alternate",
            }}
          >
            <Typography variant="h4" sx={{ marginBottom: "20px", fontWeight: "bold", color: "#000" }}>
              {questions[currentQuestion].question}
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {questions[currentQuestion].type === "options" ? (
                questions[currentQuestion].options.map((option, index) => (
                  <Grid item key={index}>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleAnswerClick(option)}
                        sx={{
                          padding: "12px 24px",
                          margin: "10px",
                          fontSize: "18px",
                          color: "#fff",
                          border: "3px solid #00e5ff",
                          backgroundColor: answers[currentQuestion] === option ? "#00e5ff" : "transparent",
                          boxShadow: "0 0 15px #00e5ff",
                          transition: "0.3s",
                          "&:hover": { backgroundColor: "#00e5ff", color: "#000" },
                        }}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  </Grid>
                ))
              ) : (
                <TextField
                  type="number"
                  variant="outlined"
                  value={answers[currentQuestion] || ""}
                  onChange={(e) => handleAnswerClick(e.target.value)}
                  sx={{
                    width: "200px",
                    marginTop: "20px",
                    backgroundColor: "#fff",
                    borderRadius: "5px",
                  }}
                  InputProps={{ style: { color: "#000" } }}
                />
              )}
            </Grid>
            <Box sx={{ marginTop: "30px" }}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  onClick={handleNextQuestion}
                  disabled={!answers[currentQuestion]}
                  sx={{
                    padding: "12px 24px",
                    fontSize: "18px",
                    backgroundColor: "#00e5ff",
                    color: "#000",
                    fontWeight: "bold",
                    boxShadow: "0 0 20px #00e5ff",
                    transition: "0.3s",
                    "&:hover": { backgroundColor: "#00bcd4" },
                    "&:disabled": { backgroundColor: "#FF0000", boxShadow: "none" },
                  }}
                >
                  {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Typography variant="h3" sx={{ color: "#00e5ff", marginBottom: "20px", fontWeight: "bold" }}>
              Thank you for sharing!
            </Typography>
            <Typography variant="h5" sx={{ color: "#fff" }}>
              Your responses will help us better understand mental wellness.
            </Typography>
          </motion.div>
        )}
      </Box>

      <style>
        {`
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 20px #00e5ff; }
            100% { box-shadow: 0 0 35px #00e5ff; }
          }
        `}
      </style>
    </>
  );
};

export default QuizPage;
