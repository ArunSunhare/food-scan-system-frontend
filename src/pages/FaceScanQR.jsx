import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import "./FaceScanQR.css";

const API_URL = "http://192.168.1.26:5001/api/qr/generate";

const FaceScanQR = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [status, setStatus] = useState("Initializing...");
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [user, setUser] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  // 🎥 Start camera on load & Load Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelLoaded(true);
        setStatus("Idle");
        startCamera();
      } catch (err) {
        console.error("Failed to load models", err);
        setStatus("❌ Model Error");
      }
    };
    loadModels();

    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  // 🧠 Face Detection Loop
  useEffect(() => {
    let animationFrameId;
    let lastScanTime = 0;
    let firstDetectionTime = 0; // Track when face was first seen
    const SCAN_COOLDOWN = 3000; // 3 seconds cooldown between API calls
    const DETECTION_STABILITY_DELAY = 1000; // Face must be stable for 1 second

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current || !modelLoaded || qrImage) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.paused || video.ended || !video.readyState) {
        animationFrameId = requestAnimationFrame(detectFaces);
        return;
      }

      // Match canvas dimensions to video DISPLAY size
      const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
      faceapi.matchDimensions(canvas, displaySize);

      // Detect Face
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      // Draw Logic
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();

      if (resizedDetections.length > 0) {
        // Face Detected
        if (firstDetectionTime === 0) {
          firstDetectionTime = now; // Start timer
        }

        // Draw Blue Box
        resizedDetections.forEach(detection => {
          const box = detection.box;
          ctx.strokeStyle = "#00BFFF"; // Deep Sky Blue
          ctx.lineWidth = 4;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          ctx.fillStyle = "#00BFFF";
          ctx.font = "16px Arial";

          // Show countdown or status
          const timeDetected = now - firstDetectionTime;
          const progress = Math.min(timeDetected / DETECTION_STABILITY_DELAY, 1);

          if (progress < 1) {
            ctx.fillText(`Scanning... ${Math.round(progress * 100)}%`, box.x, box.y - 10);
          } else {
            ctx.fillText("Capturing...", box.x, box.y - 10);
          }
        });

        // Trigger API if Face Stable & Cooldown Passed
        if (now - firstDetectionTime > DETECTION_STABILITY_DELAY && !loading && status !== "✅ QR Generated" && (now - lastScanTime > SCAN_COOLDOWN)) {
          lastScanTime = now;
          firstDetectionTime = 0; // Reset detection timer after scan
          scanFace();
        }

      } else {
        // No Face Detected - Reset Timer
        firstDetectionTime = 0;
      }

      animationFrameId = requestAnimationFrame(detectFaces);
    };

    if (modelLoaded && !qrImage) {
      detectFaces();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [modelLoaded, qrImage, loading, status]);

  const resetScan = () => {
    setQrImage(null);
    setUser(null);
    setStatus("Idle");
  };

  const scanFace = async () => {
    if (loading || qrImage) return;
    setLoading(true);
    setStatus("Scanning face...");

    const video = videoRef.current;

    // Create a temp canvas for capture to avoid drawing boxes on the image sent to API
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    tempCanvas.toBlob(async (blob) => {
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
          console.log("❌ API Error Response:", res.data);
          setStatus(res.data.message || "❌ Face not recognized");
        }
      } catch (err) {
        console.error("❌ API Request Failed:", err.response ? err.response.data : err.message);
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
              <video ref={videoRef} autoPlay className="video-feed" style={{ width: "100%", height: "auto", display: "block" }} muted />
              <canvas ref={canvasRef} className="overlay-canvas" style={{ position: 'absolute', top: 0, left: 0, width: "100%", height: "100%" }} />
              {loading && <div className="scanning-overlay"></div>}
            </div>
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
