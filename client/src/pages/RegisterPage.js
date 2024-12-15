import React, { useState } from 'react';
import axios from 'axios';
import './RegisterPage.css';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordCheckInput, setPasswordCheckInput] = useState('');
  const [passwordCheckError, setPasswordCheckError] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [isEmailAuthModalOpen, setIsEmailAuthModalOpen] = useState(false);
  const [authCode, setAuthCode] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateNickname = (nickname) => {
    const regex = /^[a-zA-Z0-9가-힣]{2,10}$/;
    return regex.test(nickname);
  };

  const validatePassword = (password) => {
    const regex = /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\W)(?=\S+$).{10,20}/;
    return regex.test(password);
  };

  const handleCheckEmail = async () => {
    if (!validateEmail(emailInput)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/check-email`, {
            params: { email: emailInput },
        });

        if (response.data === false) {
            setEmailChecked(true);
            alert('사용 가능한 이메일 입니다.');
        } else {
            setEmailChecked(false);
            setEmailError('이미 사용 중인 이메일입니다.');
        }
    } catch (error) {
        setEmailChecked(false);
        setEmailError(error.response?.data?.message || '서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const handleCheckNickname = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/check-nickname`, {
            params: { nickName: nicknameInput },
        });

        if (response.data === false) {
            setNicknameChecked(true);
            alert('사용 가능한 닉네임 입니다.');
        } else {
            setNicknameChecked(false);
            setNicknameError('이미 사용 중인 닉네임입니다.');
        }
    } catch (error) {
        setNicknameChecked(false);
        setNicknameError(error.response?.data?.message || '서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const sendVerifyRequest = async (emailInput, authCodeInput, passwordInput) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput,
          authCode: authCodeInput,
        }),
      });

      if (response.ok) {
        alert('회원가입이 완료되었습니다!');
        navigate('/login');
      } else {
        alert('인증 코드 확인 요청 실패. 다시 시도해주세요.');
      }
    } catch (error) {
      alert('서버와 통신 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleRegistration = async () => {
    if (!validateAllFields()) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users`, {
        email: emailInput,
        nickname: nicknameInput,
        password: passwordInput,
      });

      if (response.status === 202) {
        alert('이메일을 확인하여 인증코드를 입력해주세요');
        setIsEmailAuthModalOpen(true);
      } else {
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      alert(error.response?.data?.message || '서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const validateAllFields = () => {
    if (!emailInput || emailError || !emailChecked) {
      setEmailError('이메일을 올바르게 입력하고 중복 확인을 완료해주세요.');
      return false;
    }
    if (!nicknameInput || nicknameError || !nicknameChecked) {
      setNicknameError('닉네임을 올바르게 입력하고 중복 확인을 완료해주세요.');
      return false;
    }
    if (!passwordInput || passwordError) {
      setPasswordError('비밀번호를 올바르게 입력해주세요.');
      return false;
    }
    if (!passwordCheckInput || passwordCheckError) {
      setPasswordCheckError('비밀번호 확인을 완료해주세요.');
      return false;
    }
    return true;
  };

  const isFormValid = () => {
    return emailChecked && nicknameChecked && !passwordError && !passwordCheckError;
  };

  return (
    <div className="register-page">
      <h1>회원가입</h1>
      <form className="register-form">
        <div className="input-group">
          <input
            type="email"
            placeholder="이메일을 입력해주세요"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setEmailError(validateEmail(e.target.value) ? '' : '올바른 이메일 형식이 아닙니다.');
            }}
            required
            className="input-field"
          />
          <button
            type="button"
            className="check-button"
            style={{ backgroundColor: emailChecked ? '#007bff' : '#d1d1d1' }}
            onClick={handleCheckEmail}
          >
            중복 확인
          </button>
        </div>
        {emailError && <div className="error-message" style={{ color: 'red' }}>{emailError}</div>}

        <div className="input-group">
          <input
            type="text"
            placeholder="닉네임을 입력해주세요"
            value={nicknameInput}
            onChange={(e) => {
              setNicknameInput(e.target.value);
              setNicknameError(validateNickname(e.target.value) ? '' : '닉네임은 2-10자 이내로 입력해주세요.');
            }}
            required
            className="input-field"
          />
          <button
            type="button"
            className="check-button"
            style={{ backgroundColor: nicknameChecked ? '#007bff' : '#d1d1d1' }}
            onClick={handleCheckNickname}
          >
            중복 확인
          </button>
        </div>
        {nicknameError && <div className="error-message" style={{ color: 'red' }}>{nicknameError}</div>}

        <input
          type="password"
          placeholder="비밀번호를 입력해주세요"
          value={passwordInput}
          onChange={(e) => {
            setPasswordInput(e.target.value);
            setPasswordError(validatePassword(e.target.value) ? '' : '비밀번호는 10-20자, 영문, 숫자, 특수문자를 포함해야 합니다.');
          }}
          required
          className="input-field"
        />
        {passwordError && <div className="error-message" style={{ color: 'red' }}>{passwordError}</div>}

        <input
          type="password"
          placeholder="비밀번호 확인"
          value={passwordCheckInput}
          onChange={(e) => {
            setPasswordCheckInput(e.target.value);
            setPasswordCheckError(passwordInput === e.target.value ? '' : '비밀번호가 일치하지 않습니다.');
          }}
          required
          className="input-field"
        />
        {passwordCheckError && <div className="error-message" style={{ color: 'red' }}>{passwordCheckError}</div>}

        <button
          type="button"
          className="action-button"
          style={{ backgroundColor: isFormValid() ? '#007bff' : '#d1d1d1', cursor: isFormValid() ? 'pointer' : 'not-allowed' }}
          disabled={!isFormValid()}
          onClick={handleRegistration}
        >
          회원가입
        </button>
      </form>

      {isEmailAuthModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ width: '400px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>이메일 인증</h2>
            <input
              type="text"
              placeholder="인증 코드를 입력해주세요"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            />
            <button
              className="action-button"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => sendVerifyRequest(emailInput, authCode, passwordInput)}
            >
              인증 요청
            </button>
            <button
              className="action-button"
              style={{ backgroundColor: '#6c757d', width: '100%', marginTop: '10px' }}
              onClick={() => setIsEmailAuthModalOpen(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;