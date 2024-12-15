import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { updateComment } from '../request/CommentUpdateRequest';
import './PostPage.css';

const PostPage = () => {
    const { state } = useContext(AuthContext);
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${state.token}`,
                    },
                });

                if (response.ok) {
                    const postData = await response.json();
                    setPost(postData.data);
                } else {
                    alert('게시글을 불러오지 못했습니다.');
                    navigate('/main');
                }
            } catch (error) {
                console.error('게시글 로드 중 오류 발생:', error);
                navigate('/main');
            }
        };

        fetchPost();
    }, [postId, state.token, navigate]);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const createComment = async (content) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${state.token}`,
                },
                body: JSON.stringify({ content }),
            });

            if (response.ok) {
                const location = response.headers.get('Location');
                const commentId = location.split('/').pop();
                const newCommentData = { commentId, content, nickName: state.nickname, modifiedAt: new Date().toISOString() };

                setPost((prevPost) => ({
                    ...prevPost,
                    comments: [...prevPost.comments, newCommentData],
                    commentCount: prevPost.commentCount + 1,
                }));

                setNewComment('');
                alert('댓글이 성공적으로 등록되었습니다.');
            } else {
                alert('댓글 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 등록 중 오류 발생:', error);
        }
    };

    const deleteComment = async (commentId) => {
        if (window.confirm('댓글을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${state.token}`,
                    },
                });

                if (response.ok) {
                    setPost((prevPost) => ({
                        ...prevPost,
                        comments: prevPost.comments.filter((comment) => comment.commentId !== commentId),
                        commentCount: prevPost.commentCount - 1,
                    }));
                    alert('댓글이 삭제되었습니다.');
                } else {
                    alert('댓글 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('댓글 삭제 중 오류 발생:', error);
            }
        }
    };

    const handleCommentEditStart = (commentId, content) => {
        setEditingCommentId(commentId);
        setEditingContent(content);
    };

    const handleCommentSubmit = () => {
        if (!newComment.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        createComment(newComment);
    };

    const handleCommentEditComplete = async () => {
        const updatedComment = await updateComment(editingCommentId, editingContent, state.token);

        if (updatedComment) {
            setPost((prevPost) => ({
                ...prevPost,
                comments: prevPost.comments.map((comment) =>
                    comment.commentId === editingCommentId
                        ? { ...comment, content: updatedComment.content, modifiedAt: new Date().toISOString() }
                        : comment
                ),
            }));

            setEditingCommentId(null);
            setEditingContent('');
        }
    };

    const handlePostDelete = async () => {
        if (window.confirm('게시글을 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${state.token}`,
                    },
                });

                if (response.ok) {
                    alert('게시글이 삭제되었습니다.');
                    navigate('/main');
                } else {
                    alert('게시글 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('게시글 삭제 중 오류 발생:', error);
            }
        }
    };

    const handlePostEdit = () => {
        navigate('/registpost', { state: { post } });
    };

    if (!post) {
        return <div className="post-page">로딩 중...</div>;
    }

    const isAuthor = post.nickname === state.nickname;
    const isAdmin = state.nickname === '관리자';

    return (
        <div className="post-page">
            <div className="post-content-container">
                <header className="post-header">
                    <h1>{post.title}</h1>
                </header>
                <div className="post-details">
                    <p><strong>작성자:</strong> {post.nickname}</p>
                    <p><strong>작성일자:</strong> {formatDateTime(post.createdAt)}</p>
                    <p><strong>조회 수:</strong> {post.viewCount}</p>
                    <p><strong>댓글 수:</strong> {post.commentCount}</p>
                </div>
                <div className="post-body">
                    <strong>본문:</strong>
                    <p>{post.content}</p>
                </div>
                {post.imageUrl && (
                    <div className="post-image">
                        <img src={post.imageUrl} alt="게시글 첨부 이미지" />
                    </div>
                )}
            </div>

            <div className="comment-input-section">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 작성하세요..."
                    className="comment-input"
                ></textarea>
                <button className="button submit-comment-button" onClick={handleCommentSubmit}>
                    작성
                </button>
            </div>

            <div className="comments-section">
                <h2>댓글 ({post.commentCount})</h2>
                {post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                        <div key={comment.commentId} className="comment">
                            <div className="comment-header">
                                <p><strong>{comment.nickName}</strong></p>
                            </div>
                            <div className="comment-body">
                                {editingCommentId === comment.commentId ? (
                                    <textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        className="comment-edit-input"
                                        placeholder="댓글을 수정하세요..."
                                    ></textarea>
                                ) : (
                                    <p className="comment-content">{comment.content}</p>
                                )}
                                <p className="comment-date">{formatDateTime(comment.modifiedAt)}</p>
                                {comment.nickName === state.nickname && (
                                    <>
                                        {editingCommentId === comment.commentId ? (
                                            <button
                                                className="button complete-comment-button"
                                                onClick={handleCommentEditComplete}
                                            >
                                                완료
                                            </button>
                                        ) : (
                                            <button
                                                className="button edit-comment-button"
                                                onClick={() => handleCommentEditStart(comment.commentId, comment.content)}
                                            >
                                                수정
                                            </button>
                                        )}
                                        <button
                                            className="button delete-comment-button"
                                            onClick={() => deleteComment(comment.commentId)}
                                        >
                                            삭제
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>댓글이 없습니다.</p>
                )}
            </div>

            <div className="post-actions">
                <button className="button back-button" onClick={() => navigate(-1)}>
                    뒤로가기
                </button>
                {(isAuthor || isAdmin) && (
                    <>
                        {isAuthor && (
                            <button className="button edit-button" onClick={handlePostEdit}>
                                수정
                            </button>
                        )}
                        <button className="button delete-button" onClick={handlePostDelete}>
                            삭제
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PostPage;
