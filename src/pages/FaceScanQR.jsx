import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./FaceScanQR.css";

const API_URL = "http://192.168.1.26:5001/api/qr/generate";

const FaceScanQR = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [user, setUser] = useState(null);

  // 🎥 Start camera on load
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  // 📸 Capture + API Call
  // 🔄 Auto-Scan Logic
  useEffect(() => {
    let interval;
    if (!qrImage && !loading && status !== "✅ QR Generated") {
      interval = setInterval(() => {
        scanFace();
      }, 3000); // Scan every 3 seconds
    }
    return () => clearInterval(interval);
  }, [qrImage, loading, status]);

  const resetScan = () => {
    setQrImage(null);
    setUser(null);
    setStatus("Idle");
  };

  const scanFace = async () => {
    if (loading || qrImage) return; // Prevent multiple calls
    setLoading(true);
    setStatus("Scanning face...");

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("face_image", blob, "face.jpg");

      try {
        const res = await axios.post(API_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        if (res.data.success) {
          setQrImage(res.data.data.qr_image);
          setUser(res.data.data.user);
          setStatus("✅ QR Generated");
        } else {
          console.log("❌ API Error Response:", res.data); // Debugging
          setStatus(res.data.message || "❌ Face not recognized");
        }
      } catch (err) {
        console.error("❌ API Request Failed:", err.response ? err.response.data : err.message); // Debugging
        setStatus(err.response?.data?.message || "❌ Face not recognized");
      } finally {
        setLoading(false);
      }
    }, "image/jpeg");
  };

  const getStatusClass = () => {
    if (status === "✅ QR Generated") return "success";
    if (status.includes("❌")) return "error";
    if (status === "Scanning face...") return "scanning";
    return "";
  };

  return (
    <div className="face-scan-container">
      <div className="scanner-card">
        <h2 className="scanner-title">🍽️ Food Face Scan</h2>

        {!qrImage ? (
          <>
            <div className="video-wrapper">
              <video ref={videoRef} autoPlay className="video-feed" />
              {loading && <div className="scanning-overlay"></div>}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div className={`status-badge ${getStatusClass()}`}>
              {status}
            </div>
          </>
        ) : (
          <div className="result-card">
            <div className={`status-badge ${getStatusClass()}`}>
              {status}
            </div>
            <img src={qrImage} alt="QR Code" className="qr-image" />
            <div className="user-details">
              <p><b>Name:</b> {user.name}</p>
              <p><b>Mobile:</b> {user.mobile}</p>
              <p><b>Role:</b> {user.role}</p>
            </div>
            <button onClick={resetScan} className="scan-again-btn">
              Scan Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceScanQR;
