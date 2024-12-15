import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserPage.css';

function UserPage() {
    const { state } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const pageSize = 10;

    // 사용자 데이터 가져오기
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`, {
                params: {
                    page: currentPage,
                    size: pageSize,
                },
                headers: {
                    Authorization: `Bearer ${state.token}`,
                },
            });

            const { content, totalPages: serverTotalPages } = response.data;

            setUsers(content || []);
            setTotalPages(serverTotalPages || 1);
        } catch (error) {
            console.error('유저 데이터 로드 실패:', error);
            alert('유저 데이터를 불러오는 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    // 페이지 변경
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="user-page">
            <header className="user-page-header">
                <h1>회원 목록</h1>
                <button onClick={() => navigate('/mypage')} className="back-to-main-button">
                    마이 페이지로 돌아가기
                </button>
            </header>
            <main>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th style={{ width: '25%' }}>이메일</th>
                            <th style={{ width: '25%' }}>닉네임</th>
                            <th style={{ width: '25%' }}>생성일자</th>
                            <th style={{ width: '25%' }}>유저 상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.email}</td>
                                <td>{user.nickname}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>{user.userStatus}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* 페이지네이션 */}
                <div className="pagination-container">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-button"
                    >
                        이전
                    </button>
                    <span className="pagination-info">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-button"
                    >
                        다음
                    </button>
                </div>
            </main>
        </div>
    );
}

export default UserPage;
