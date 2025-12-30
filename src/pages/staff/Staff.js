import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerStaff } from "../../services/staff/staff_regis";

const Staff = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    department: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  /* ================= CAMERA CLEANUP ================= */

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => { });
    }
  }, [isCameraOpen]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors({});
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // only digits
    if (value.length <= 10) {
      setFormData((prev) => ({ ...prev, phoneNumber: value }));
    }
    setErrors({});
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setCameraError("");
    } catch {
      setCameraError("Unable to access camera");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError("");
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      setPhoto(new File([blob], "staff.jpg", { type: "image/jpeg" }));
      setPhotoPreview(canvas.toDataURL("image/jpeg"));
      stopCamera();
    });
  };

  const resetForm = () => {
    setFormData({ name: "", phoneNumber: "", email: "", department: "" });
    setPhoto(null);
    setPhotoPreview(null);
    setErrors({});
    setApiError("");
    if (isCameraOpen) stopCamera();
  };

  /* ================= VALIDATION ================= */

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = "Name is required";
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      err.phoneNumber = "Phone number must be exactly 10 digits";
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      err.email = "Valid email is required";
    }
    if (!formData.department.trim()) err.department = "Department is required";
    if (!photo) err.photo = "Photo is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ================= SUBMIT WITH API ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      const form = new FormData();
      form.append("full_name", formData.name);
      form.append("mobile_number", formData.phoneNumber);
      form.append("email", formData.email);
      form.append("role", "staff");
      form.append("department", formData.department);
      form.append("face_image", photo);

      const res = await registerStaff(form);

      if (res.success) {
        setSubmitted(true);
        setTimeout(() => navigate("/selection"), 1500);
      } else {
        setApiError(res.message);
      }
    } catch (err) {
      setApiError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUCCESS ================= */

  if (submitted) {
    return (
      <div className="page-container">
        <div className="success-message">Staff registered successfully!</div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1
        }}
      />
      <div className="page-container">

        <h1 className="page-title">Staff Information</h1>
        <p className="page-subtitle">Please provide your staff details</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "12px" }}>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              disabled={loading}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group" style={{ marginBottom: "12px" }}>
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              className="form-input"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter 10 digit phone number"
              maxLength={10}
              disabled={loading}
            />
            {errors.phoneNumber && (
              <div className="error-message">{errors.phoneNumber}</div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: "12px" }}>
            <label className="form-label">Email Id</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email id"
              disabled={loading}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group" style={{ marginBottom: "12px" }}>
            <label className="form-label">Department</label>
            <input
              type="text"
              name="department"
              className="form-input"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
              disabled={loading}
            />
            {errors.department && (
              <div className="error-message">{errors.department}</div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: "12px" }}>
            <label className="form-label">Photo</label>
            {photoPreview && (
              <div style={{ marginBottom: "10px" }}>
                <img
                  src={photoPreview}
                  alt="Staff member preview"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "0.8em",
                    color: "#666",
                    marginTop: "5px",
                  }}
                >
                  Photo preview
                </p>
              </div>
            )}
            {errors.photo && <div className="error-message">{errors.photo}</div>}
          </div>

          {isCameraOpen ? (
            <div className="form-group" style={{ marginBottom: "12px" }}>
              <label className="form-label">Camera Preview</label>
              <video
                ref={videoRef}
                autoPlay
                muted
                style={{
                  width: "100%",
                  maxWidth: "250px",
                  height: "auto",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  display: "block",
                  margin: "0 auto 10px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={capturePhoto}
                  disabled={loading}
                >
                  Capture Photo
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={stopCamera}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: "12px" }}>
              <label className="form-label">Add Photo</label>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={startCamera}
                  disabled={loading}
                >
                  Capture Image
                </button>
              </div>
              {cameraError && <div className="error-message">{cameraError}</div>}
            </div>
          )}

          {apiError && <div className="error-message">{apiError}</div>}

          <div style={{ textAlign: "center", marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading}>
              Clear
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
              Back
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Staff;