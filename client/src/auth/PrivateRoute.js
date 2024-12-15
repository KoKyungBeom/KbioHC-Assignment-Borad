import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

function PrivateRoute({ children }) {
    const { state } = useContext(AuthContext);

    if (!state.token) {
        // 로그인 상태가 아니면 로그인 페이지로 리다이렉트
        return <Navigate to="/login" replace />;
    }

    // 로그인 상태라면 요청한 컴포넌트 렌더링
    return children;
}

export default PrivateRoute;
