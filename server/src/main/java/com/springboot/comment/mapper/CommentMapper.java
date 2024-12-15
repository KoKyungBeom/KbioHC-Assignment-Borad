package com.springboot.comment.mapper;

import com.springboot.comment.dto.CommentDto;
import com.springboot.comment.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    @Mapping(source = "postId", target = "post.postId")
    Comment commentCreateDtoToComment(CommentDto.Create create);
    Comment commentUpdateDtoToComment(CommentDto.Update update);
    @Mapping(source = "post.title", target = "title")
    @Mapping(source = "post.postId", target = "postId")
    CommentDto.ListResponse commentToListResponseDto(Comment comment);
    List<CommentDto.ListResponse> commentsToListResponseDtos(List<Comment> comments);
    default CommentDto.DetailedResponse commentToDetailedResponseDto(Comment comment) {
        CommentDto.DetailedResponse.DetailedResponseBuilder response = CommentDto.DetailedResponse.builder();
            response.postId(comment.getPost().getPostId());
            response.commentId(comment.getCommentId());
            response.content(comment.getContent());
            response.title(comment.getPost().getTitle());
            response.nickName(comment.getUser().getNickname());
            response.modifiedAt(comment.getModifiedAt());

            return response.build();
    }
    List<CommentDto.DetailedResponse> commentsToDetailedResponseDtos(List<Comment> comments);
}
