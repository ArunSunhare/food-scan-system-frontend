import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://192.168.1.15:5001/api/qr/generate";

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
  const scanFace = async () => {
    setLoading(true);
    setStatus("Scanning face...");
    setQrImage(null);
    setUser(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
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
          setStatus(res.data.message || "❌ Failed");
        }
      } catch (err) {
        setStatus(err.response?.data?.message || "❌ Face not recognized");
      }

      setLoading(false);
    }, "image/jpeg");
  };

  return (
    <div style={styles.container}>
      <h2>🍽️ Food Face Scan</h2>

      <video ref={videoRef} autoPlay style={styles.video} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button onClick={scanFace} disabled={loading} style={styles.button}>
        {loading ? "Scanning..." : "Scan Face"}
      </button>

      <p>{status}</p>

      {qrImage && (
        <div style={styles.qrBox}>
          <img src={qrImage} alt="QR" />
          <p><b>Name:</b> {user.name}</p>
          <p><b>Mobile:</b> {user.mobile}</p>
          <p><b>Role:</b> {user.role}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: 20,
    background: "#f4f6f8",
    height: "100vh"
  },
  video: {
    width: 320,
    borderRadius: 10,
    border: "2px solid #333"
  },
  button: {
    marginTop: 15,
    padding: "10px 20px",
    fontSize: 16,
    cursor: "pointer"
  },
  qrBox: {
    marginTop: 20,
    background: "#fff",
    padding: 15,
    borderRadius: 10
  }
};

export default FaceScanQR;
