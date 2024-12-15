package com.springboot.comment.repository;

import com.springboot.comment.entity.Comment;
import com.springboot.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByUser(Pageable pageable, User user);
    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.post.postId = :postId")
    void deleteByPostId(@Param("postId") Long postId);
}
