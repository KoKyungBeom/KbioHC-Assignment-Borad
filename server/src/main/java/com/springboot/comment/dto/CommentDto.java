package com.springboot.comment.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CommentDto {
    @Builder
    @Getter
    @Setter
    public static class Create {
        private long postId;
        @NotNull
        private String content;
    }
    @Builder
    @Getter
    @Setter
    public static class Update {
        private long commentId;
        @NotNull
        private String content;
    }
    @Builder
    @Getter
    public static class ListResponse {
        private long postId;
        private String content;
        private String title;
        private LocalDateTime modifiedAt;
    }
    @Builder
    @Getter
    public static class DetailedResponse {
        private long postId;
        private long commentId;
        private String content;
        private String title;
        private String nickName;
        private LocalDateTime modifiedAt;
    }
}
