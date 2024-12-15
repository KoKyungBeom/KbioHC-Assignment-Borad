import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import './RegistPost.css';

function RegistPost() {
    const { state } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const post = location.state?.post || null; // 전달받은 게시글 데이터

    const [author, setAuthor] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');

    useEffect(() => {
        // 작성자 초기화 및 수정 모드일 경우 기존 데이터 로드
        if (state?.nickname) {
            setAuthor(state.nickname);
        }

        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setUploadedImageUrl(post.imageUrl || '');
        }
    }, [state.nickname, post]);

    const handleImageUpload = async () => {
        if (!imageFile) {
            alert('업로드할 이미지를 선택하세요.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', imageFile);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/upload-image`, {
                method: 'POST',
                headers: {
                    Authorization: `${state.token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const imageUrl = await response.text();
                setUploadedImageUrl(imageUrl);
                alert('이미지가 성공적으로 업로드되었습니다.');
            } else {
                console.error('이미지 업로드 실패:', response.status);
                alert('이미지 업로드에 실패했습니다.');
            }
        } catch (error) {
            console.error('이미지 업로드 중 오류 발생:', error);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert('제목과 본문을 모두 작성해주세요.');
            return;
        }

        const method = post ? 'PATCH' : 'POST'; // 수정이면 PATCH, 아니면 POST
        const url = post
            ? `${process.env.REACT_APP_API_URL}/posts/${post.postId}`
            : `${process.env.REACT_APP_API_URL}/posts`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${state.token}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                    imageUrl: uploadedImageUrl,
                }),
            });

            if (response.ok) {
                alert(post ? '게시글이 수정되었습니다.' : '게시글이 성공적으로 등록되었습니다.');
                navigate('/main');
            } else {
                console.error(`${post ? '수정' : '등록'} 실패:`, response.status);
                alert('작업에 실패했습니다.');
            }
        } catch (error) {
            console.error(`${post ? '수정' : '등록'} 중 오류 발생:`, error);
        }
    };

    return (
        <div className="regist-post">
            <header className="post-header">
                <h1>{post ? '글 수정' : '글 작성'}</h1>
            </header>
            <main className="post-form">
                <div className="grid-container">
                    <input
                        type="text"
                        value={author}
                        placeholder="작성자를 입력하세요"
                        className="author-input"
                        readOnly
                    />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className="title-input"
                    />
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="본문 내용을 입력하세요"
                    className="content-textarea"
                ></textarea>
                <div className="image-upload-group">
                    <input
                        type="file"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="image-upload"
                    />
                    <button type="button" onClick={handleImageUpload} className="button upload-button">
                        이미지 업로드
                    </button>
                </div>
                <div className="form-actions">
                    <button onClick={() => navigate(-1)} className="button cancel-button">
                        취소
                    </button>
                    <button onClick={handleSubmit} className="button submit-button">
                        완료
                    </button>
                </div>
            </main>
        </div>
    );
}

export default RegistPost;
