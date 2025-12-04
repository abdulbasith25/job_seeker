import React, { useState } from "react";
import mammoth from "mammoth";

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/legacy/build/pdf";

GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

const sendToBackend = async (extractedText) => {
  try {
    const res = await fetch("https://technopark-alert-api-1.onrender.com/upload_cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cv_text: extractedText,
        // optional: user id/email if you want to identify who uploaded
        candidate_id: "basith@example.com"
      })
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.detail || "Upload failed");
    alert("CV sent to backend ✅");
  } catch (err) {
    console.error("Send failed:", err);
    alert("Failed to send CV to backend");
  }
};

export default function CVUpload() {
  const [text, setText] = useState("");

  // 1. Extract text from PDF
const extractPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  let extracted = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    extracted += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return extracted;
};


  // 2. Extract text from DOCX
  const extractDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // 3. Handle file upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    let extractedText = "";

    if (file.name.endsWith(".pdf")) {
      extractedText = await extractPDF(file);
    } else if (file.name.endsWith(".docx")) {
      extractedText = await extractDOCX(file);
    } else {
      alert("Upload a PDF or DOCX only!");
      return;
    }

    setText(extractedText);
    sendToBackend(extractedText);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload Your CV</h2>
      <input type="file" accept=".pdf, .docx" onChange={handleUpload} />

      <h3>Extracted Text:</h3>
      <textarea
        value={text}
        readOnly
        style={{
          width: "100%",
          height: 300,
          marginTop: 10,
          padding: 10,
          fontSize: "14px",
        }}
      />
    </div>
  );
}



// inside CVUpload.jsx - add after setText(extractedText)

