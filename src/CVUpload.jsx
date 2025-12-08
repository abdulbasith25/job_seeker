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
        candidate_id: "basith@example.com"
      })
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.detail || "Upload failed");
    return true;
  } catch (err) {
    console.error("Send failed:", err);
    throw err;
  }
};

export default function CVUpload() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const [showFlowchart, setShowFlowchart] = useState(false);
  const [showReadme, setShowReadme] = useState(false);

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

  const extractDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setUploaded(false);

    try {
      let extractedText = "";

      if (file.name.endsWith(".pdf")) {
        extractedText = await extractPDF(file);
      } else if (file.name.endsWith(".docx")) {
        extractedText = await extractDOCX(file);
      } else if (file.name.endsWith(".txt")) {
        extractedText = await file.text();
      } else {
        throw new Error("Please upload a PDF, DOCX, or TXT file only!");
      }

      setText(extractedText);
      setFileName(file.name);
      await sendToBackend(extractedText);
      setUploaded(true);
    } catch (err) {
      setError(err.message || "Failed to process file");
      setText("");
      setFileName("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fef08a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>
        
        {/* Banana Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '96px', 
            display: 'inline-block',
            animation: 'bounce 2s infinite'
          }}>
            
          </div>
        </div>

        {/* Upload Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          border: '4px dashed #d1d5db',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ padding: '48px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px'
            }}>
              
              {/* Icon Circle */}
              <div style={{
                width: '128px',
                height: '128px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: uploaded ? '#dcfce7' : uploading ? '#fef3c7' : '#fde68a',
                transition: 'all 0.3s ease',
                fontSize: '64px'
              }}>
                {uploaded ? '✓' : uploading ? '⏳' : '↑'}
              </div>

              {/* Title */}
              <div style={{ textAlign: 'center' }}>
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '12px',
                  margin: 0
                }}>
                  {uploaded ? 'CV Uploaded Successfully!' : 'Upload Your CV'}
                </h2>
                <p style={{
                  color: '#6b7280',
                  fontSize: '18px',
                  margin: '8px 0 0 0'
                }}>
                  {uploading ? 'Processing your file...' : 'PDF, DOCX, TXT'}
                </p>
              </div>

              {/* File Name Display */}
              {fileName && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#fef3c7',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  border: '2px solid #fcd34d'
                }}>
                  <span style={{ fontSize: '20px' }}>📄</span>
                  <span style={{ color: '#374151', fontWeight: '500' }}>{fileName}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div style={{
                  background: '#fee2e2',
                  border: '2px solid #fca5a5',
                  color: '#991b1b',
                  padding: '12px 24px',
                  borderRadius: '8px'
                }}>
                  {error}
                </div>
              )}

              {/* Upload Button */}
              {!uploaded && !uploading && (
                <label htmlFor="cv-upload">
                  <button
                    type="button"
                    onClick={() => document.getElementById('cv-upload').click()}
                    style={{
                      background: '#fbbf24',
                      color: '#1f2937',
                      fontWeight: 'bold',
                      padding: '16px 32px',
                      borderRadius: '9999px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#f59e0b'}
                    onMouseOut={(e) => e.target.style.background = '#fbbf24'}
                  >
                    Choose File
                  </button>
                </label>
              )}
            </div>

            <input
              id="cv-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </div>
        </div>

        {/* Disclaimer Section */}
        <div style={{
          marginTop: '32px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          border: '2px solid #fbbf24'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '48px' }}>⚠️</span>
          </div>
          <p style={{
            fontSize: '18px',
            color: '#374151',
            lineHeight: '1.8',
            textAlign: 'center',
            margin: '0',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '500',
            letterSpacing: '0.3px'
          }}>
            This is created for personal purpose, so uploading here won't give you alerts. If you want to have this service,{' '}
            <a 
              href="#flowchart" 
              onClick={(e) => {
                e.preventDefault();
                setShowFlowchart(!showFlowchart);
                if (!showFlowchart) {
                  setTimeout(() => {
                    document.getElementById('flowchart-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              style={{
                color: '#f59e0b',
                fontWeight: '700',
                textDecoration: 'none',
                borderBottom: '2px solid #fbbf24',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = '#d97706'}
              onMouseOut={(e) => e.target.style.color = '#f59e0b'}
            >
              click here to {showFlowchart ? 'hide' : 'view'} the flowchart
            </a>
            {' '}and build it yourself!
          </p>
        </div>

        {/* Flowchart Section */}
        {showFlowchart && (
          <div 
            id="flowchart-section"
            style={{
              marginTop: '32px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '48px 32px',
              border: '1px solid #e5e7eb',
              animation: 'fadeIn 0.5s ease-in'
            }}
          >
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '48px',
            margin: '0 0 48px 0'
          }}>
            🔄 System Architecture Flow
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            position: 'relative'
          }}>
            {/* Connecting Lines */}
            <svg style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '4px', height: '100%', zIndex: 0 }}>
              <line x1="2" y1="0" x2="2" y2="100%" stroke="#fbbf24" strokeWidth="3" strokeDasharray="10,5" />
            </svg>

            {/* Step 1: React Upload */}
            <div style={{
              background: 'linear-gradient(135deg, #61dafb 0%, #21a1c4 100%)',
              padding: '28px 40px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(97, 218, 251, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1)',
              minWidth: '320px',
              textAlign: 'center',
              border: '3px solid rgba(255,255,255,0.3)',
              position: 'relative',
              zIndex: 1,
              transform: 'translateX(-20px)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-20px) scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(-20px) scale(1)'}
            >
              <div style={{ 
                fontSize: '52px', 
                marginBottom: '12px',
                background: 'white',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <img width="45" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" />
              </div>
              <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '22px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                React File Upload
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.95)', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                Extract text from PDF/DOCX<br/><span style={{fontSize: '12px', opacity: 0.8}}>(Hosted on Render)</span>
              </p>
            </div>

            {/* Animated Arrow 1 */}
            <div style={{ fontSize: '40px', color: '#fbbf24', zIndex: 1, animation: 'bounce 2s infinite' }}>⬇️</div>

            {/* Step 2: FastAPI Backend */}
            <div style={{
              background: 'linear-gradient(135deg, #00c9a7 0%, #00796b 100%)',
              padding: '28px 40px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1)',
              minWidth: '320px',
              textAlign: 'center',
              border: '3px solid rgba(255,255,255,0.3)',
              position: 'relative',
              zIndex: 1,
              transform: 'translateX(20px)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(20px) scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(20px) scale(1)'}
            >
              <div style={{ 
                fontSize: '52px', 
                marginBottom: '12px',
                background: 'white',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <img width="45" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" />
              </div>
              <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '22px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                Python FastAPI
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.95)', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                Process CV & scrape job portals<br/><span style={{fontSize: '12px', opacity: 0.8}}>(Hosted on Render)</span>
              </p>
            </div>

            {/* Animated Arrow 2 */}
            <div style={{ fontSize: '40px', color: '#fbbf24', zIndex: 1, animation: 'bounce 2s infinite 0.3s' }}>⬇️</div>

            {/* Step 3: Gemini AI */}
            <div style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
              padding: '28px 40px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(167, 139, 250, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1)',
              minWidth: '320px',
              textAlign: 'center',
              border: '3px solid rgba(255,255,255,0.3)',
              position: 'relative',
              zIndex: 1,
              transform: 'translateX(-20px)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-20px) scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(-20px) scale(1)'}
            >
              <div style={{ 
                fontSize: '52px', 
                marginBottom: '12px',
                background: 'white',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <img width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" />
              </div>
              <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '22px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                Gemini API
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.95)', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                AI analyzes CV and generates alerts
              </p>
            </div>

            {/* Animated Arrow 3 */}
            <div style={{ fontSize: '40px', color: '#fbbf24', zIndex: 1, animation: 'bounce 2s infinite 0.6s' }}>⬇️</div>

            {/* Step 4: Telegram Bot */}
            <div style={{
              background: 'linear-gradient(135deg, #0088cc 0%, #0077b5 100%)',
              padding: '28px 40px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 136, 204, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1)',
              minWidth: '320px',
              textAlign: 'center',
              border: '3px solid rgba(255,255,255,0.3)',
              position: 'relative',
              zIndex: 1,
              transform: 'translateX(20px)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(20px) scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(20px) scale(1)'}
            >
              <div style={{ 
                fontSize: '52px', 
                marginBottom: '12px',
                background: 'white',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <img width="40" src="https://img.icons8.com/?size=100&id=lUktdBVdL4Kb&format=png" />
              </div>
              <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '22px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                Telegram Bot API
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.95)', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                Send notifications to your Telegram
              </p>
            </div>

            {/* Tech Stack Note */}
            <div style={{
              marginTop: '32px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: '24px 32px',
              borderRadius: '16px',
              border: '3px solid #fbbf24',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 8px 20px rgba(251, 191, 36, 0.3)',
              zIndex: 1,
              position: 'relative'
            }}>
              <p style={{
                fontSize: '15px',
                color: '#78350f',
                margin: 0,
                textAlign: 'center',
                lineHeight: '1.8',
                fontWeight: '600'
              }}>
                <strong style={{fontSize: '18px'}}>💡 Tech Stack:</strong><br/>
                React + Render + FastAPI + Gemini AI + Telegram Bot
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Contact Section */}
        <div style={{
          marginTop: '32px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          border: '1px solid #e5e7eb',
          marginBottom: '100px'
        }}>
          <div style={{
            background: '#fef3c7',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 16px 0',
              textAlign: 'center'
            }}>
              Need Help? Contact Me!
            </h3>
            <div style={{ 
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a 
                href="https://wa.me/919745065452"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#25D366',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: '24px' }}>💬</span>
                <span>WhatsApp: +91 9745065452</span>
              </a>
              
              <button
                onClick={() => {
                  setShowReadme(true);
                  setTimeout(() => {
                    document.getElementById('readme-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: '24px' }}>📖</span>
                <span>README</span>
              </button>
            </div>
          </div>
        </div>

        {/* README Notepad Section */}
        {showReadme && (
          <>
            {/* Overlay */}
            <div 
              onClick={() => setShowReadme(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
                animation: 'fadeIn 0.3s ease-in'
              }}
            />
            
            {/* Modal */}
            <div 
              id="readme-section"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '80vh',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                zIndex: 1000,
                animation: 'fadeIn 0.3s ease-in',
                overflow: 'hidden',
                border: '3px solid #fbbf24'
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #d97706'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>📖</span>
                  <h3 style={{ 
                    margin: 0, 
                    color: 'white', 
                    fontSize: '22px', 
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    Project Description
                  </h3>
                </div>
                <button
                  onClick={() => setShowReadme(false)}
                  style={{
                    background: 'rgba(255,255,255,0.3)',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                >
                  ×
                </button>
              </div>

              {/* Scrollable Content */}
              <div style={{
                padding: '32px',
                maxHeight: 'calc(80vh - 80px)',
                overflowY: 'auto',
                background: '#fffbeb',
                fontFamily: '"Courier New", monospace'
              }}>
                {/* 
                  ========================================
                  PASTE YOUR README CONTENT BELOW THIS LINE
                  ========================================
                */}
                
                <div style={{ color: '#78350f', lineHeight: '1.8' }}>
                  <h2 style={{ color: '#92400e', marginTop: 0 }}>✨ Features</h2>
                  
                  <h3 style={{ color: '#b45309' }}>🔹 CV Upload & Text Extraction</h3>
                  <ul style={{ marginLeft: '20px' }}>
                    <li>Supports PDF and DOCX files</li>
                    <li>Extracts text entirely on the frontend (no file upload)</li>
                  </ul>

                  <p style={{ 
                    background: '#fef3c7', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '2px dashed #fbbf24',
                    marginTop: '24px'
                  }}>
                    <strong>💡 Note:</strong> Automated AI-Powered Job Matching System

In today’s fast-paced digital world, job searching has become a repetitive and time-consuming activity. While scrolling through job portals during my free time at work, I had a simple thought: “Why am I doing this manually every day? Why not automate it?”
That moment sparked the idea for this project — an AI-powered job-matching system that automatically analyzes a user's CV, fetches job opportunities from online portals, evaluates the relevance of those jobs using artificial intelligence, and sends the best matches directly to the user through Telegram.

The goal was straightforward: eliminate the repetitive task of checking job portals and allow AI to proactively deliver personalized job recommendations.

Introduction

This project integrates frontend automation, backend intelligence, and AI-driven decision making into a single system. It begins with a web interface where users can upload their CV. Instead of sending the actual file to the server, the application extracts text directly on the client side using pdf.js (for PDFs) and mammoth.js (for Word documents). This improves privacy and performance, since the file never leaves the user’s system — only the extracted text is sent.

On the backend, a FastAPI service stores the CV and periodically fetches fresh job listings from online portals such as Technopark Jobs. This process runs automatically every few minutes using Render’s cron scheduler. Once job data is collected, the system uses the Gemini 2.5 Flash model to compare the user’s CV with the latest openings. The AI evaluates skills, job descriptions, responsibilities, and keywords to determine the most relevant matches. It then selects the top five jobs and prepares a short explanation for each match — effectively acting like a personal AI career assistant.

Finally, the matched jobs are delivered directly to the user via a Telegram bot. These notifications occur in two forms:

Periodic alerts every few minutes, keeping the user updated with fresh opportunities.

A daily summary at exactly 12 PM, ensuring the user receives a consolidated report without being spammed.

This combination of automation and AI transforms the job-search process into a seamless experience.

System Architecture

The project follows a clear and modular architecture:

React Frontend
The user uploads their CV through a simple interface. The system extracts the text directly in the browser to ensure speed and privacy. Once extracted, the CV text is sent to the backend.

FastAPI Backend (Render)
The backend stores the CV text and fetches new job postings at regular intervals. It serves as the integration point between the frontend, job sources, AI model, and Telegram.

AI Processing (Gemini 2.5 Flash)
The backend prompts Gemini with two inputs — the CV and the job listings. The model evaluates, ranks, and explains why each job is a match.

Telegram Bot Delivery
The selected job matches are formatted and delivered to the user instantly.

Cron Automation
The backend runs on its own without user action. Every few minutes it fetches jobs, analyzes them, and sends updates if necessary.

Motivation

The main inspiration came from a simple realization: job searching is repetitive, and repetition is where automation shines. For people looking for opportunities — especially freshers or those in competitive fields — missing a job posting by even a few hours can make a difference. With the rise of AI tools like Gemini, it became possible to build a system that not only automates job fetching but also understands the content of a CV and finds meaningful matches.

The irony is amusing: using AI to search for jobs in a world where AI might eventually take over many jobs.
But until then, we might as well use it to our advantage.

Key Features

Secure CV Handling – No file uploads; only text extraction.

AI-Based Job Matching – Intelligent evaluation using Gemini.

Automated Job Fetching – No manual searching required.

Daily Summary – Ensures you stay updated without overload.

Real-Time Alerts – Instant job recommendations sent to Telegram.

Serverless Deployment – Runs reliably without maintenance.

Impact

This project showcases how modern tools — client-side extraction, serverless computing, automation loops, and AI reasoning models — can work together to simplify everyday tasks. It demonstrates practical automation, clean architecture, and the integration of multiple technologies into a smooth user experience.

More importantly, it shows how AI can augment human workflows rather than replace them. By offloading the repetitive work to the system, users can focus on preparing for interviews, improving their skills, and applying strategically.

Conclusion

What began as a small thought during free time evolved into a fully functional AI-powered job-matching system. It is fast, secure, automated, and intelligent — a compact example of how AI can streamline real-world tasks. The project integrates multiple technologies, but the essence remains simple:

👉 Upload your CV once.
👉 Let the system work for you forever.

And as funny as it is, the same AI that might reshape our jobs today is helping us find new opportunities tomorrow.
                    </p>
                    </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}