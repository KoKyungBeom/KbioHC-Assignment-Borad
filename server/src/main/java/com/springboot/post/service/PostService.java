package com.springboot.post.service;

import com.springboot.auth.utils.Principal;
import com.springboot.comment.repository.CommentRepository;
import com.springboot.exception.BusinessLogicException;
import com.springboot.exception.ExceptionCode;
import com.springboot.post.entity.Post;
import com.springboot.post.entity.View;
import com.springboot.post.repository.PostRepository;
import com.springboot.post.repository.ViewRepository;
import com.springboot.user.entity.User;
import com.springboot.user.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserService userService;
    private final ViewRepository viewRepository;
    private final CommentRepository commentRepository;

    public PostService(PostRepository postRepository, UserService userService, ViewRepository viewRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.userService = userService;
        this.viewRepository = viewRepository;
        this.commentRepository = commentRepository;
    }
    //게시글을 생성하는 메서드
    public Post createPost(Post post, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        User findUser = userService.findUser(principal.getUserId());

        if (principal.getUserId() == 0) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        } else if(principal.getUsername().equals("admin@gmail.com")) {
            post.setNotice(true);
        }
        post.setUser(findUser);

        return postRepository.save(post);
    }
    //게시글을 수정하는 메서드
    public Post updatePost(Post post, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        Post findPost = findVerifiedPost(post.getPostId());

        if (principal.getUserId() != findPost.getUser().getUserId()) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }
        if (post.getPostStatus() == Post.PostStatus.DELETED) {
            throw new BusinessLogicException(ExceptionCode.POST_NOT_FOUND);
        }

        Optional.ofNullable(post.getTitle())
                .ifPresent(title -> findPost.setTitle(title));
        Optional.ofNullable(post.getContent())
                .ifPresent(content -> findPost.setContent(content));
        Optional.ofNullable(post.getImageUrl())
                .ifPresent(imageUrl -> findPost.setImageUrl(imageUrl));

        findPost.setModifiedAt(LocalDateTime.now());

        return postRepository.save(findPost);
    }
    //postId로 게시글을 찾는 메서드
    public Post findPost(long postId, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        Post post = findVerifiedPost(postId);

        if (principal.getUserId() == 0) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }
        if (post.getPostStatus() == Post.PostStatus.DELETED) {
            throw new BusinessLogicException(ExceptionCode.POST_NOT_FOUND);
        }
        createView(postId,authentication);

        return findVerifiedPost(postId);
    }
    //사용자가 작성한 게시글을 찾는 메서드
    public Page<Post> findPostsByUser(int page, int size, long userId, String sortBy) {
        Pageable pageable = createPageable(page, size, sortBy);

        User User = userService.findUser(userId);

        return postRepository.findByUserAndPostStatusNot(pageable, User, Post.PostStatus.DELETED);
    }
    //공지시항을 찾는 메서드
    public Page<Post> findNotices(int page, int size, String standard) {
        Pageable pageable = createPageable(page, size, standard);

        return postRepository.findByNoticeTrueAndPostStatusNot(pageable, Post.PostStatus.DELETED);
    }
    //최신공지사항 2개를 찾는 메서드
    public List<Post> findLatestNotices() {
        return postRepository.findTop2Notices();
    }
    //게시글을 찾는 메서드(삭제상태 제외) 검색어에 따라 다르게 반환
    public Page<Post> findPosts(int page, int size, String searchBy, String keyword, String sortBy) {
        Pageable pageable = createPageable(page, size, sortBy);
        Post.PostStatus postStatus = Post.PostStatus.DELETED;

        if ((searchBy == null || searchBy.isEmpty()) && (keyword == null || keyword.isEmpty())) {
            return postRepository.findByPostStatusNot(pageable, postStatus);
        }

        if ((searchBy != null && !searchBy.isEmpty()) && (keyword == null || keyword.isEmpty())) {
            throw new BusinessLogicException(ExceptionCode.SEARCH_KEYWORD_REQUIRED);
        }

        if ((searchBy == null || searchBy.isEmpty()) && (keyword != null && !keyword.isEmpty())) {
            throw new BusinessLogicException(ExceptionCode.SEARCH_CRITERIA_REQUIRED);
        }

        switch (searchBy.toLowerCase()) {
            case "title":
                return postRepository.findByTitleContaining(keyword, postStatus, pageable);
            case "content":
                return postRepository.findByContentContaining(keyword, postStatus, pageable);
            case "nickname":
                return postRepository.findByNicknameContaining(keyword, postStatus, pageable);
            default:
                throw new BusinessLogicException(ExceptionCode.INVALID_SEARCH_CRITERIA);
        }
    }
    //postId로 유효한 게시글인지 검증하는 메서드
    private Post findVerifiedPost(long postId) {
        Optional<Post> post = postRepository.findById(postId);

        return post.orElseThrow(() -> new BusinessLogicException(ExceptionCode.POST_NOT_FOUND));
    }
    //Pageable을 만드는 메서드 (정렬기준 반영)
    private Pageable createPageable(int page, int size, String sortBy) {
        Sort sort;

        if (sortBy != null && !sortBy.isEmpty()) {
            if (sortBy.equals("views")) {
                sort = Sort.by(Sort.Order.desc("views"), Sort.Order.desc("createdAt"));
            } else {
                sort = Sort.by(Sort.Order.desc(sortBy));
            }
        } else {
            sort = Sort.by(Sort.Order.desc("createdAt"));
        }

        return PageRequest.of(page, size, sort);
    }
    //게시글을 삭제하는 메서드(게시글 상태 변경)
    public void deletePost(long postId, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();
        List roles = (List) authentication.getAuthorities();

        Post post = findVerifiedPost(postId);

        if (principal.getUserId() != post.getUser().getUserId()) {
            if (!roles.contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
                throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
            }
        }
        post.setPostStatus(Post.PostStatus.DELETED);
        commentRepository.deleteByPostId(postId);

        postRepository.save(post);
    }
    //조회를 생성하는 메서드(사용자당 1회)
    private void createView(long postId, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        Post findPost = findVerifiedPost(postId);

        User findUser = userService.findUser(principal.getUserId());

        Optional<View> optionalRead = viewRepository.findByUserAndPost(findUser, findPost);

        if (optionalRead.isPresent()) {

        } else {
            View addView = new View();
            addView.setPost(findPost);
            addView.setUser(findUser);
            viewRepository.save(addView);
        }
    }
}
