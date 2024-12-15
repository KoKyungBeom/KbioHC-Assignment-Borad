export const updateComment = async (commentId, updatedContent, token) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/comments/${commentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // token은 호출 시 전달
            },
            body: JSON.stringify({ content: updatedContent }),
        });

        if (response.ok) {
            const updatedComment = await response.json();
            alert('댓글이 성공적으로 수정되었습니다.');
            return updatedComment.data; // 업데이트된 댓글 데이터를 반환
        } else {
            console.error('댓글 수정 실패:', response.status);
            alert('댓글 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('댓글 수정 중 오류 발생:', error);
        alert('서버와 통신 중 오류가 발생했습니다.');
    }
    return null;
};
