package com.springboot.comment.service;

import com.springboot.auth.utils.Principal;
import com.springboot.comment.entity.Comment;
import com.springboot.comment.repository.CommentRepository;
import com.springboot.exception.BusinessLogicException;
import com.springboot.exception.ExceptionCode;
import com.springboot.user.entity.User;
import com.springboot.user.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final UserService userService;

    public CommentService(CommentRepository commentRepository, UserService userService) {
        this.commentRepository = commentRepository;
        this.userService = userService;
    }
    //댓글을 생성하는 메서드
    public Comment createComment(Comment comment, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        User findUser = userService.findUser(principal.getUserId());

        comment.setUser(findUser);

        return commentRepository.save(comment);
    }
    //댓글을 수정하는 메서드
    public Comment updateComment (Comment comment, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        Comment findComment = findVerifiedComment(comment.getCommentId());

        if (principal.getUserId() != findComment.getUser().getUserId()) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }
        Optional.ofNullable(comment.getContent())
                .ifPresent(findComment::setContent);

        findComment.setModifiedAt(LocalDateTime.now());

        return commentRepository.save(findComment);
    }
    //사용자의 댓글을 찾는 메서드
    public Page<Comment> findComments(int page, int size, long userId, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        User findUser = userService.findUser(principal.getUserId());

        if (userId != findUser.getUserId()) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        Pageable pageable = PageRequest.of(page, size);

        return commentRepository.findByUser(pageable, findUser);
    }
    //댓글을 삭제하는 메서드
    public void deleteComment (long commentId, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        Comment comment = findVerifiedComment(commentId);

        if (principal.getUserId() != comment.getUser().getUserId()) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }

        commentRepository.delete(comment);
    }
    //댓글을 찾는 메서드
    public Comment findComment (Long commentId) {
        return findVerifiedComment(commentId);
    }

    //commentId로 유효한 댓글인지 검증하는 메서드
    private Comment findVerifiedComment (long commentId) {
        Optional<Comment> comment = commentRepository.findById(commentId);

        return comment.orElseThrow(() -> new BusinessLogicException(ExceptionCode.COMMENT_NOT_FOUND));
    }
}
