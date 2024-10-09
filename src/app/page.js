"use client";
import Tesseract from "tesseract.js";
import axios from "axios";
import React, { useState } from "react";
import { Button, Container, Typography, Box } from "@mui/material";

export default function Home() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");

  // Checks if a file is selected, stores the file as a preview and sets the file name
  // Runs OCR if not an x-ray
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setFileName(file.name.toLowerCase());

      if (
        !file.name.toLowerCase().includes("xray") &&
        !file.name.toLowerCase().includes("x-ray")
      ) {
        performOCR(file);
      }
    } else {
      console.log("No file selected");
    }
  };

  const performOCR = (file) => {
    console.log(file);
    // Perform OCR on document images
    Tesseract.recognize(file, "eng", { logger: (m) => console.log(m) }).then(
      ({ data: { text } }) => {
        setText(text);
      }
    );
  };

  // Performs an async call to the OpenAI API for NLP, updates the text state with the output from OpenAI response
  const handleNLP = async () => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: `Extract medical terms: ${text}` },
          ],
          max_tokens: 50,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          },
        }
      );
      // console.log(response.data.choices[0].text);
      setText(response.data.choices[0].message.content);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          POC Demo
        </Typography>
        <input
          type="file"
          onChange={handleFileChange}
          style={{ marginBottom: "16px" }}
        />
        {image && <img id="Image" src={image} alt="Uploaded" width={300} />}
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNLP}
            style={{ marginRight: "8px" }}
          >
            Extract Medical Terms
          </Button>
        </Box>
        <Typography variant="body1" style={{ marginTop: "16px" }}>
          {text}
        </Typography>
      </Box>
    </Container>
  );
}
