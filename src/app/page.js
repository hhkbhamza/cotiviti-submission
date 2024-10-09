"use client";
import Tesseract from "tesseract.js";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");

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
    <div>
      <h1>POC</h1>
      <input type="file" onChange={handleFileChange} />
      {image && <img id="Image" src={image} alt="ig" width={300} />}
      <button onClick={handleNLP}>Extract Medical Terms</button>
      <p>{text}</p>
    </div>
  );
}
