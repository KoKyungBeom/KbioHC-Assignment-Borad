package com.springboot.post.dto;

import com.springboot.comment.dto.CommentDto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class PostDto {
    @Builder
    @Getter
    @Setter
    public static class Create {
        @NotNull
        private String title;
        @NotNull
        private String content;
        private String imageUrl;
    }
    @Builder
    @Getter
    @Setter
    public static class Update {
        private long postId;
        private String title;
        private String content;
        private String imageUrl;
    }
    @Builder
    @Getter
    public static class ListResponse {
        private long postId;
        private String title;
        private String content;
        private String nickname;
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;
        private boolean notice;
    }
    @Builder
    @Getter
    public static class DetailedResponse {
        private long postId;
        private String title;
        private String content;
        private String nickname;
        private String imageUrl;
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;
        private int viewCount;
        private int commentCount;
        private boolean notice;
        private List<CommentDto.DetailedResponse> comments;
    }
}
