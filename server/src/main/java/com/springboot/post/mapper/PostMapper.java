package com.springboot.post.mapper;

import com.springboot.comment.mapper.CommentMapper;
import com.springboot.post.dto.PostDto;
import com.springboot.post.entity.Post;
import org.mapstruct.Mapper;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = CommentMapper.class)
public interface PostMapper {
    Post postCreateDtoToPost(PostDto.Create createDto);
    Post postUpdateDtoToPost(PostDto.Update updateDto);
    default PostDto.ListResponse postToListResponseDto(Post post) {
        PostDto.ListResponse.ListResponseBuilder response = PostDto.ListResponse.builder();
            response.postId(post.getPostId());
            response.title(post.getTitle());
            response.content(post.getContent());
            response.createdAt(post.getCreatedAt());
            response.modifiedAt(post.getModifiedAt());
            response.nickname(post.getUser().getNickname());
            response.notice(post.isNotice());

            return response.build();
    }
    default List<PostDto.ListResponse> postsToListResponseDtos(List<Post> posts) {
        return posts.stream()
                .map(post -> postToListResponseDto(post))
                .collect(Collectors.toList());
    }
    default PostDto.DetailedResponse postToDetailedResponseDto(Post post, CommentMapper commentMapper) {
        PostDto.DetailedResponse.DetailedResponseBuilder response = PostDto.DetailedResponse.builder();
            response.postId(post.getPostId());
            response.title(post.getTitle());
            response.content(post.getContent());
            response.nickname(post.getUser().getNickname());
            response.imageUrl(post.getImageUrl());
            response.createdAt(post.getCreatedAt());
            response.modifiedAt(post.getModifiedAt());
            response.viewCount(post.getViews().size());
            response.commentCount(post.getComments().size());
            response.notice(post.isNotice());
            response.comments(commentMapper.commentsToDetailedResponseDtos(post.getComments()));

            return response.build();
    }
    default List<PostDto.DetailedResponse> postsToDetailedResponseDtos(List<Post> posts, CommentMapper commentMapper) {
        return posts.stream()
                .distinct()
                .map(post -> postToDetailedResponseDto(post, commentMapper))
                .collect(Collectors.toList());
    }
}
