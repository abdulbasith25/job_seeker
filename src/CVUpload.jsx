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
            😊
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



        {/* Support Button */}
        <div style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px'
        }}>
          <button style={{
            background: 'white',
            color: '#1f2937',
            fontWeight: '600',
            padding: '12px 24px',
            borderRadius: '9999px',
            border: '2px solid #e5e7eb',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#f9fafb'}
          onMouseOut={(e) => e.target.style.background = 'white'}
          >
            <span style={{ color: '#ef4444' }}>❤️</span>
            <span>Support</span>
          </button>
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
                setShowFlowchart(true);
                setTimeout(() => {
                  document.getElementById('flowchart-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
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
              click here to view the flowchart
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
            gap: '24px'
          }}>
            {/* Step 1: React Upload */}
            <div style={{
              background: 'linear-gradient(135deg, #61dafb 0%, #0088cc 100%)',
              padding: '24px 32px',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              minWidth: '300px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}><img width="55" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" /></div>
              <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
                React File Upload
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '14px' }}>
                Extract text from PDF/DOCX (Hosted on Render)
              </p>
            </div>

            {/* Arrow Down */}
            <div style={{ fontSize: '32px', color: '#fbbf24' }}>⬇️</div>

            {/* Step 2: FastAPI Backend */}
            <div style={{
              background: 'linear-gradient(135deg, #009688 0%, #00695c 100%)',
              padding: '24px 32px',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              minWidth: '300px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}><img width = "55" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" />
</div>
              <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
                Python FastAPI
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '14px' }}>
                Process CV data (Hosted on Render)
              </p>
            </div>

            {/* Arrow Down */}
            <div style={{ fontSize: '32px', color: '#fbbf24' }}>⬇️</div>

            {/* Step 3: Gemini AI */}
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              padding: '24px 32px',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              minWidth: '300px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}><img width="50" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" /></div>
              <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
                Gemini API
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '14px' }}>
                AI analyzes CV and generates alerts
              </p>
            </div>

            {/* Arrow Down */}
            <div style={{ fontSize: '32px', color: '#fbbf24' }}>⬇️</div>

            {/* Step 4: Telegram Bot */}
            <div style={{
              background: 'linear-gradient(135deg, #0088cc 0%, #005f8d 100%)',
              padding: '24px 32px',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              minWidth: '300px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}><img width="50" src="https://img.icons8.com/?size=100&id=lUktdBVdL4Kb&format=png" /></div>
              <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
                Telegram Bot API
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '14px' }}>
                Send notifications to your Telegram
              </p>
            </div>

            {/* Tech Stack Note */}
            <div style={{
              marginTop: '32px',
              background: '#fef3c7',
              padding: '20px',
              borderRadius: '12px',
              border: '2px dashed #fbbf24',
              width: '100%',
              maxWidth: '500px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#78350f',
                margin: 0,
                textAlign: 'center',
                lineHeight: '1.6'
              }}>
                <strong>💡 Tech Stack:</strong> React + Render + FastAPI + Gemini AI + Telegram Bot
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
            <div style={{ textAlign: 'center' }}>
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
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: '24px' }}>💬</span>
                <span>WhatsApp: +91 9745065452</span>
              </a>
            </div>
          </div>
        </div>

        {/* Keyframes for bounce animation */}
        <style>{`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}