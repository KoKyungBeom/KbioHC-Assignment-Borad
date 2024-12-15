package com.springboot.post.repository;

import com.springboot.post.entity.Post;
import com.springboot.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByUserAndPostStatusNot(Pageable pageable, User user, Post.PostStatus postStatus);
    Page<Post> findByPostStatusNot(Pageable pageable, Post.PostStatus postStatus);
    Page<Post> findByNoticeTrueAndPostStatusNot(Pageable pageable, Post.PostStatus postStatus);
    @Query(value = "SELECT * FROM posts p WHERE p.notice = true AND p.post_status != 'DELETED' ORDER BY p.created_at DESC LIMIT 2", nativeQuery = true)
    List<Post> findTop2Notices();
    @Query("SELECT p FROM Post p " +
            "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "AND p.postStatus <> :postStatus")
    Page<Post> findByTitleContaining(@Param("keyword") String keyword, @Param("postStatus") Post.PostStatus postStatus, Pageable pageable);
    @Query("SELECT p FROM Post p " +
            "WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "AND p.postStatus <> :postStatus")
    Page<Post> findByContentContaining(@Param("keyword") String keyword, @Param("postStatus") Post.PostStatus postStatus, Pageable pageable);
    @Query("SELECT p FROM Post p JOIN p.user u " +
            "WHERE LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "AND p.postStatus <> :postStatus")
    Page<Post> findByNicknameContaining(@Param("keyword") String keyword, @Param("postStatus") Post.PostStatus postStatus, Pageable pageable);

}
