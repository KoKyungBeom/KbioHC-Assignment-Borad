import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MainPage.css';

function MainPage() {
    const { state, logout } = useContext(AuthContext);
    const [notices, setNotices] = useState([]);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchBy, setSearchBy] = useState('');
    const [keyword, setKeyword] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [isViewingNotices, setIsViewingNotices] = useState(false); // 공지사항 보기 상태
    const navigate = useNavigate();

    const pageSize = 10;

    // 게시글 가져오기
    const fetchPosts = async (searchFilters, sortOption) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts`, {
                params: {
                    page: currentPage,
                    size: pageSize,
                    searchBy: searchFilters?.searchBy || null,
                    keyword: searchFilters?.keyword || null,
                    sortBy: sortOption || 'createdAt',
                },
                headers: {
                    Authorization: `Bearer ${state.token}`,
                },
            });

            const { notices: noticeData, data: postData, pageInfo } = response.data;

            const filteredPosts = postData.filter(post => !post.notice);

            setNotices(noticeData || []);
            setPosts(filteredPosts || []);
            setTotalPages(pageInfo?.totalPage || 1);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message || '잘못된 요청입니다.');
            } else {
                console.error('게시글 로드 실패:', error);
                alert('게시글을 불러오는 도중 오류가 발생했습니다.');
            }
        }
    };

    // 공지사항 가져오기
    const fetchNotices = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts/notice`, {
                params: {
                    page: currentPage,
                    size: pageSize,
                    sortBy,
                },
                headers: {
                    Authorization: `Bearer ${state.token}`,
                },
            });

            const { data: noticeData, pageInfo } = response.data;

            setNotices(noticeData || []);
            setPosts([]); // 공지사항 보기 시 일반 게시글은 비웁니다.
            setTotalPages(pageInfo?.totalPage || 1);
        } catch (error) {
            console.error('공지사항 로드 실패:', error);
            alert('공지사항을 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 전체 글 보기
    const fetchAllPosts = async () => {
        try {
            setCurrentPage(1); // 페이지 초기화
            setIsViewingNotices(false); // 전체 글 보기 상태로 전환
            fetchPosts({ searchBy, keyword }, sortBy);
        } catch (error) {
            console.error('전체 글 로드 실패:', error);
            alert('전체 글을 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 초기 데이터 로드
    useEffect(() => {
        fetchPosts({ searchBy, keyword }, sortBy);
    }, [currentPage, state.token]);

    // 검색
    const handleSearch = () => {
        setCurrentPage(1); // 페이지 초기화
        fetchPosts({ searchBy, keyword }, sortBy);
    };

    // 정렬 변경
    const handleSortChange = (sortOption) => {
        setSortBy(sortOption); // 정렬 기준 상태 업데이트
        fetchPosts({ searchBy, keyword }, sortOption); // 정렬 요청
    };

    // 공지사항 버튼 클릭 핸들러
    const handleNoticeButtonClick = () => {
        if (isViewingNotices) {
            // 전체 글 보기로 전환
            fetchAllPosts();
        } else {
            // 공지사항만 보기로 전환
            setCurrentPage(1); // 페이지 초기화
            setIsViewingNotices(true); // 공지사항 보기 상태로 전환
            fetchNotices();
        }
    };

    // 로그아웃
    const handleLogout = async () => {
        if (window.confirm('로그아웃하시겠어요?')) {
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/auth/logout`,
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${state.token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    alert('로그아웃 되었습니다.');
                    logout();
                    navigate('/login');
                }
            } catch (error) {
                console.error('로그아웃 요청 실패:', error);
                alert(error.response?.data?.message || '서버와 통신 중 오류가 발생했습니다.');
            }
        }
    };

    // 페이지 변경
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            fetchPosts({ searchBy, keyword }, sortBy);
        }
    };

    return (
        <div className="main-page">
            <header className="main-header">
                <h1 className="main-title">간단한 게시판</h1>
                <div className="user-actions">
                    <span>{state.nickname}님, 환영합니다!</span>
                    <button onClick={() => navigate('/mypage')}>내 정보</button>
                    <button className="logout-button" onClick={handleLogout}>로그아웃</button>
                </div>
            </header>
            <main>
                <table className="posts-table">
                    <thead>
                        {/* 검색 및 정렬 영역 */}
                        <tr className="search-and-sort-wrapper">
                            <td colSpan="4">
                                <div className="search-and-sort">
                                    <input
                                        type="text"
                                        placeholder="검색어를 입력하세요"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        className="search-input"
                                        disabled={isViewingNotices}
                                    />
                                    <select
                                        value={searchBy}
                                        onChange={(e) => setSearchBy(e.target.value)}
                                        className="search-select"
                                        disabled={isViewingNotices}
                                    >
                                        <option value="">검색 기준</option>
                                        <option value="title">제목</option>
                                        <option value="content">내용</option>
                                        <option value="nickname">작성자</option>
                                    </select>
                                    <button onClick={handleSearch} className="search-button" disabled={isViewingNotices}>
                                        검색
                                    </button>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className="sort-select"
                                    >
                                        <option value="createdAt">최신순</option>
                                        <option value="views">조회순</option>
                                    </select>
                                </div>
                            </td>
                        </tr>
                        {/* 테이블 헤더 */}
                        <tr>
                            <th style={{ width: '50px' }}>NO</th>
                            <th style={{ width: '150px' }}>작성자</th>
                            <th style={{ width: '500px' }}>제목</th>
                            <th style={{ width: '150px' }}>작성일자</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notices.map((notice) => (
                            <tr
                                key={notice.postId}
                                onClick={() => navigate(`/posts/${notice.postId}`)}
                                className="notice-row"
                            >
                                <td>{`[공지]`}</td>
                                <td>{notice.nickname}</td>
                                <td>{notice.title}</td>
                                <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}

                        {posts.map((post, index) => (
                            <tr
                                key={post.postId}
                                onClick={() => navigate(`/posts/${post.postId}`)}
                            >
                                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                <td>{post.nickname}</td>
                                <td>{post.title}</td>
                                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* 페이지네이션 */}
                <div className="pagination-container">
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="pagination-button"
                            disabled={currentPage === 1}
                        >
                            이전
                        </button>
                        <span className="pagination-info">{currentPage} / {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="pagination-button"
                            disabled={currentPage === totalPages}
                        >
                            다음
                        </button>
                    </div>
                </div>
                {/* 글 작성 버튼과 공지사항 보기 버튼 */}
                <div className="write-button-container">
                    <button onClick={handleNoticeButtonClick} className="write-button notice-button">
                        {isViewingNotices ? '전체 글 보기' : '공지사항만 보기'}
                    </button>
                    <button onClick={() => navigate('/registpost')} className="write-button">
                        글 작성
                    </button>
                </div>
            </main>
        </div>
    );
}

export default MainPage;
