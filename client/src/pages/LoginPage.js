import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import './LoginPage.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth(); // useAuth로 login 사용

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
                username,
                password,
            
            });
    
            const token = response.headers['authorization'];

            if (token) {
                const userInfoResponse = await axios.get(`${process.env.REACT_APP_API_URL}/users/mypage`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                const nickname = userInfoResponse.data.data.nickname;
                const userId = userInfoResponse.data.data.userId
                login(token, userId, nickname);
                navigate('/main');
            } else {
                alert('로그인에 실패했습니다. 토큰이 없습니다.');
            }
        } catch (error) {
            alert(error.response?.data?.message || '서버와 통신 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="login-page">
            <h1>간단한 게시판</h1>
            <form className="login-form" onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="이메일을 입력해주세요"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="input-field"
                />
                <input
                    type="password"
                    placeholder="비밀번호를 입력해주세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field"
                />
                <button type="submit" className="login-button">로그인</button>
                <button type="button" className="action-button" onClick={() => navigate('/register')}>회원가입</button>
            </form>
        </div>
    );
}

export default LoginPage;
