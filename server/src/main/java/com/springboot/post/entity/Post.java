package com.springboot.post.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.springboot.comment.entity.Comment;
import com.springboot.user.entity.User;
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
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long postId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String content;

    @Column
    private String imageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime modifiedAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean notice = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PostStatus postStatus = PostStatus.REGISTERED;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "USER_ID")
    @JsonBackReference("user-post")
    private User user;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY)
    @JsonManagedReference("post-view")
    private List<View> views = new ArrayList<>();

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY)
    @JsonManagedReference("post-comment")
    private List<Comment> comments = new ArrayList<>();

    public enum PostStatus {
        REGISTERED("등록 상태"),
        DELETED("삭제 상태");

        @Getter
        @Setter
        private String status;

        PostStatus(String status) {
            this.status = status;
        }
    }
}

