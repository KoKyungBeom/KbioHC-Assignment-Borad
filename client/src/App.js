import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import MyPage from './pages/MyPage';
import RegistPost from './pages/RegistPost';
import PostPage from './pages/PostPage';
import UserPage from './pages/UserPage';
import PrivateRoute from './auth/PrivateRoute';

function App() {
    return (
      <AuthProvider>
        <Router>
            <Routes>
                {/* 로그인 페이지와 회원가입 페이지는 누구나 접근 가능 */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* 보호된 경로 (로그인 필요) */}
                <Route
                    path="/main"
                    element={
                        <PrivateRoute>
                            <MainPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/mypage"
                    element={
                        <PrivateRoute>
                            <MyPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/registpost"
                    element={
                        <PrivateRoute>
                            <RegistPost />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/posts/:postId"
                    element={
                        <PrivateRoute>
                            <PostPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <PrivateRoute>
                            <UserPage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
      </AuthProvider> 
    );
}

export default App;
