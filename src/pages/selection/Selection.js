import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Selection = () => {
  const [selectedOption, setSelectedOption] = useState(null); // 'staff' or 'guest'
  const navigate = useNavigate();

  useEffect(() => {
    const isRegistered = localStorage.getItem('registered');
    if (!isRegistered) {
      navigate('/register');
    }
  }, [navigate]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption === 'staff') {
      navigate('/staff');
    } else if (selectedOption === 'guest') {
      navigate('/guest');
    }
  };

  const handleBack = () => {
    navigate('/register'); // 👈 Back to login/register
    // OR: navigate(-1);
  };

  return (
    <div className="page-container selection-view">
      <h1 className="page-title">Select Your Role</h1>
      <p className="page-subtitle">Choose how you want to proceed</p>

      <div className="option-container">
        <div
          className={`option-card ${selectedOption === 'staff' ? 'selected' : ''}`}
          onClick={() => handleOptionSelect('staff')}
        >
          <div className="option-title">Staff</div>
          <div className="option-description">I am a staff member</div>
        </div>

        <div
          className={`option-card ${selectedOption === 'guest' ? 'selected' : ''}`}
          onClick={() => handleOptionSelect('guest')}
        >
          <div className="option-title">Guest</div>
          <div className="option-description">I am a guest visitor</div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}
      >
        <button
          className="btn btn-primary"
          onClick={handleContinue}
          disabled={!selectedOption}
          style={{
            opacity: selectedOption ? 1 : 0.5,
            cursor: selectedOption ? 'pointer' : 'not-allowed'
          }}
        >
          Continue
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleBack}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Selection;
