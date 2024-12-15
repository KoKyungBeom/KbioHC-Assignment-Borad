package com.springboot.post.repository;

import com.springboot.post.entity.Post;
import com.springboot.post.entity.View;
import com.springboot.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ViewRepository extends JpaRepository<View, Long> {
    Optional<View> findByUserAndPost(User user, Post post);
}
