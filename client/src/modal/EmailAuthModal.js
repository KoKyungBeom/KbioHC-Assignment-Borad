import React, { useState } from 'react';
import './EmailAuthModal.css';

const EmailAuthModal = ({ onClose, onRegister }) => {
    const [authCode, setAuthCode] = useState('');
    
    const handleRegister = () => {
        onRegister(authCode);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h2>이메일 인증</h2>
                <input
                    type="text"
                    placeholder="인증 코드를 입력해주세요"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="input-field"
                />
                <div className="modal-buttons">
                    <button className="modal-button" onClick={handleRegister}>인증 요청</button>
                    <button className="modal-button cancel-button" onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
};

export default EmailAuthModal;