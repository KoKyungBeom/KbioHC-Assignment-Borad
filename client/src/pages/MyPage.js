import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyPage.css';

function MyPage() {
    const { state, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [myPosts, setMyPosts] = useState([]);
    const [myComments, setMyComments] = useState([]);
    const [postPage, setPostPage] = useState(1);
    const [commentPage, setCommentPage] = useState(1);
    const [postTotalPages, setPostTotalPages] = useState(1);
    const [commentTotalPages, setCommentTotalPages] = useState(1);

    const pageSize = 5;

    const fetchMyPosts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts/my-posts`, {
                params: {
                    page: postPage,
                    size: pageSize,
                    sortBy: 'createdAt',
                },
                headers: {
                    Authorization: `Bearer ${state.token}`,
                },
            });

            const { data: posts, pageInfo } = response.data;
            setMyPosts(posts);
            setPostTotalPages(pageInfo?.totalPage || 1);
        } catch (error) {
            console.error('내 게시글 로드 실패:', error);
            alert('내 게시글을 불러오는 중 오류가 발생했습니다.');
        }
    };

    const fetchMyComments = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/comments`, {
                params: {
                    page: commentPage,
                    size: pageSize,
                    'user-id': state.userId,
                },
                headers: {
                    Authorization: `Bearer ${state.token}`,
                },
            });

            const { data: comments, pageInfo } = response.data;
            setMyComments(comments);
            setCommentTotalPages(pageInfo?.totalPage || 1);
        } catch (error) {
            console.error('내 댓글 로드 실패:', error);
            alert('내 댓글을 불러오는 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('정말 회원 탈퇴하시겠습니까?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/users/${state.userId}`, {
                    headers: {
                        Authorization: `Bearer ${state.token}`,
                    },
                });

                alert('회원 탈퇴가 완료되었습니다.');
                logout(); // 로그아웃 처리
                navigate('/login');
            } catch (error) {
                console.error('회원 탈퇴 요청 실패:', error);
                alert('회원 탈퇴 중 오류가 발생했습니다.');
            }
        }
    };

    useEffect(() => {
        fetchMyPosts();
    }, [postPage]);

    useEffect(() => {
        fetchMyComments();
    }, [commentPage]);

    return (
        <div className="my-page">
            <header className="my-page-header">
                <h1>{state.nickname}님의 정보</h1>
                <div className="header-buttons">
                    <button onClick={() => navigate('/main')} className="back-to-main-button">
                        메인으로 돌아가기
                    </button>
                    {state.nickname === '관리자' ? (
                        <button
                            onClick={() => navigate('/users')}
                            className="view-users-button"
                        >
                            회원 목록
                        </button>
                    ) : (
                        <button
                            onClick={handleDeleteAccount}
                            className="delete-account-button"
                        >
                            회원 탈퇴
                        </button>
                    )}
                </div>
            </header>
            <main>
                <section className="my-posts-section">
                    <h2>내 게시글</h2>
                    <table className="posts-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>NO</th>
                                <th style={{ width: '70%' }}>제목</th>
                                <th style={{ width: '20%' }}>작성일자</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myPosts.map((post, index) => (
                                <tr
                                    key={`post-${post.postId}`}
                                    onClick={() => navigate(`/posts/${post.postId}`)}
                                    className="post-row"
                                >
                                    <td>{(postPage - 1) * pageSize + index + 1}</td>
                                    <td>{post.title}</td>
                                    <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination-container">
                        <button
                            onClick={() => setPostPage(postPage - 1)}
                            disabled={postPage === 1}
                        >
                            이전
                        </button>
                        <span>{postPage} / {postTotalPages}</span>
                        <button
                            onClick={() => setPostPage(postPage + 1)}
                            disabled={postPage === postTotalPages}
                        >
                            다음
                        </button>
                    </div>
                </section>
                <section className="my-comments-section">
                    <h2>내 댓글</h2>
                    <table className="comments-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>NO</th>
                                <th style={{ width: '70%' }}>내용</th>
                                <th style={{ width: '20%' }}>작성일자</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myComments.map((comment, index) => (
                                <tr
                                    key={`comment-${comment.commentId || index}`} // commentId가 없으면 index를 사용
                                    className="comment-row"
                                    onClick={() => navigate(`/posts/${comment.postId}`)}
                                >
                                    <td>{(commentPage - 1) * pageSize + index + 1}</td>
                                    <td>{comment.content}</td>
                                    <td>{new Date(comment.modifiedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination-container">
                        <button
                            onClick={() => setCommentPage(commentPage - 1)}
                            disabled={commentPage === 1}
                        >
                            이전
                        </button>
                        <span>{commentPage} / {commentTotalPages}</span>
                        <button
                            onClick={() => setCommentPage(commentPage + 1)}
                            disabled={commentPage === commentTotalPages}
                        >
                            다음
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default MyPage;
