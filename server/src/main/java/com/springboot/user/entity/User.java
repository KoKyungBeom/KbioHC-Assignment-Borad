package com.springboot.user.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.springboot.comment.entity.Comment;
import com.springboot.post.entity.Post;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long userId;

    @Column(length = 30, nullable = false, updatable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 10, nullable = false, unique = true)
    private String nickname;

    @Enumerated(value = EnumType.STRING)
    @Column(length = 10, nullable = false)
    private UserStatus userStatus = UserStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime modifiedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "user")
    @JsonManagedReference("user-post")
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @JsonManagedReference("user-comment")
    private List<Comment> comments = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> roles = new ArrayList<>();

    public enum UserStatus {
        ACTIVE("활동중"),
        QUIT("탈퇴 상태");

        @Getter
        @Setter
        private String status;

        UserStatus(String status) {
            this.status = status;
        }
    }
    //smtp 인증에서 필요
    public User(String email) {
        this.email = email;
    }
}

