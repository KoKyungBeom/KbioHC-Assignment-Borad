import React from 'react';
import './ModalCheck.css';

const ModalCheck = ({ message, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <p>{message}</p>
                <button className="modal-button" onClick={onClose}>확인</button>
            </div>
        </div>
    );
};

export default ModalCheck;