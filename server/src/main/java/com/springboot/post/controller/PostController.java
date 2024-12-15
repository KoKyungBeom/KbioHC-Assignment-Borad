package com.springboot.post.controller;

import com.springboot.auth.utils.Principal;
import com.springboot.comment.mapper.CommentMapper;
import com.springboot.exception.BusinessLogicException;
import com.springboot.exception.ExceptionCode;
import com.springboot.post.dto.PostDto;
import com.springboot.post.entity.Post;
import com.springboot.post.mapper.PostMapper;
import com.springboot.post.service.PostService;
import com.springboot.response.MultiResponseDto;
import com.springboot.response.SingleResponseDto;
import com.springboot.service.S3Service;
import com.springboot.user.entity.User;
import com.springboot.user.service.UserService;
import com.springboot.utils.UriCreator;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import javax.validation.constraints.Positive;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/posts")
@Validated
public class PostController {
    private final PostService postService;
    private final PostMapper postMapper;
    private final UserService userService;
    private final CommentMapper commentMapper;
    private final S3Service s3Service;
    private final static String POST_DEFAULT_URL = "/posts";

    public PostController(PostService postService, PostMapper postMapper, UserService userService, CommentMapper commentMapper, S3Service s3Service) {
        this.postService = postService;
        this.postMapper = postMapper;
        this.userService = userService;
        this.commentMapper = commentMapper;
        this.s3Service = s3Service;
    }
    @PostMapping
    public ResponseEntity createPost(@Valid @RequestBody PostDto.Create createDto,
                                     Authentication authentication) {
        Post createdPost = postService.createPost(postMapper.postCreateDtoToPost(createDto), authentication);

        URI location = UriCreator.createUri(POST_DEFAULT_URL, createdPost.getPostId());

        return ResponseEntity.created(location).build();
    }
    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam(value = "file",required = false) MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessLogicException(ExceptionCode.FILE_NOT_FOUND);
        }

        String imageUrl = s3Service.uploadFile(file);

        return ResponseEntity.ok(imageUrl);
    }
    @PatchMapping("{post-id}")
    public ResponseEntity updatePost(@PathVariable("post-id") @Positive long postId,
                                     @Valid @RequestBody PostDto.Update updateDto,
                                     Authentication authentication) {
        updateDto.setPostId(postId);

        Post post = postService.updatePost(postMapper.postUpdateDtoToPost(updateDto), authentication);

        return new ResponseEntity<>(new SingleResponseDto<>(postMapper.postToListResponseDto(post)), HttpStatus.OK);
    }
    @GetMapping("{post-id}")
    public ResponseEntity getPost(@PathVariable("post-id") @Positive long postId,
                                  Authentication authentication) {
        Post post = postService.findPost(postId,authentication);

        return new ResponseEntity<>(new SingleResponseDto<>(postMapper.postToDetailedResponseDto(post, commentMapper)), HttpStatus.OK);
    }
    @GetMapping("/notice")
    public ResponseEntity getNotices(@Positive @RequestParam int page,
                                     @Positive @RequestParam int size,
                                     @RequestParam(required = false, defaultValue = "createdAt") String sortBy) {
        Page<Post> notices = postService.findNotices(page - 1, size, sortBy);

        List<Post> posts = notices.getContent();

        return new ResponseEntity<>(new MultiResponseDto<>(postMapper.postsToListResponseDtos(posts), notices), HttpStatus.OK);
    }
    @GetMapping("/my-posts")
    public ResponseEntity<?> getMyPosts(@RequestParam @Positive int page,
                                        @RequestParam @Positive int size,
                                        @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
                                        Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        Page<Post> posts = postService.findPostsByUser(page - 1, size, principal.getUserId(), sortBy);
        List<PostDto.ListResponse> postResponse = postMapper.postsToListResponseDtos(posts.getContent());

        return new ResponseEntity<>(new MultiResponseDto<>(postResponse, posts), HttpStatus.OK);
    }
    @GetMapping
    public ResponseEntity getPosts(@RequestParam @Positive int page,
                                   @RequestParam @Positive int size,
                                   @RequestParam(required = false) String searchBy,
                                   @RequestParam(required = false) String keyword,
                                   @RequestParam(required = false, defaultValue = "createdAt") String sortBy) {
        List<Post> notices = postService.findLatestNotices();
        List<PostDto.ListResponse> noticeResponse = postMapper.postsToListResponseDtos(notices);

        Page<Post> Posts = postService.findPosts(page - 1, size, searchBy, keyword, sortBy);
        List<PostDto.ListResponse> postResponse = postMapper.postsToListResponseDtos(Posts.getContent());

        return new ResponseEntity<>(new MultiResponseDto<>(postResponse, noticeResponse, Posts), HttpStatus.OK);
    }
    @DeleteMapping("{post-id}")
    public ResponseEntity deletePost(@PathVariable("post-id") @Positive long postId,
                                     Authentication authentication) {
        postService.deletePost(postId, authentication);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
