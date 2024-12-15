package com.springboot.user.controller;

import com.springboot.auth.utils.Principal;
import com.springboot.exception.BusinessLogicException;
import com.springboot.exception.ExceptionCode;
import com.springboot.response.SingleResponseDto;
import com.springboot.service.email.EmailService;
import com.springboot.service.email.VerificationDto;
import com.springboot.user.dto.UserDto;
import com.springboot.user.entity.User;
import com.springboot.user.mapper.UserMapper;
import com.springboot.user.service.UserService;
import com.springboot.utils.UriCreator;
import org.springframework.data.domain.Page;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;
import java.net.URI;

@RestController
@RequestMapping("/users")
@Validated
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final static String USER_DEFAULT_URL = "/users";

    public UserController(UserService userService, UserMapper userMapper, EmailService emailService, RedisTemplate<String, Object> redisTemplate) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.emailService = emailService;
        this.redisTemplate = redisTemplate;
    }
    @PostMapping
    public ResponseEntity postUser(@Valid @RequestBody UserDto.Post postDto) {
        userService.createUser(userMapper.userPostDtoToUser(postDto));

        return ResponseEntity.status(HttpStatus.ACCEPTED).body("이메일을 확인하여 인증코드를 입력해주세요");
    }
    @PostMapping("/verify")
    public ResponseEntity registerUser(@Valid @RequestBody VerificationDto verificationDto) {
        if (emailService.verifyEmailCode(verificationDto)) {
            redisTemplate.delete(verificationDto.getEmail() + ":auth");
            User user = userService.registerUser(verificationDto);
            URI location = UriCreator.createUri(USER_DEFAULT_URL, user.getUserId());
            return ResponseEntity.created(location).build();
        }

        throw new BusinessLogicException(ExceptionCode.AUTHENTICATION_FAILED);
    }
    @GetMapping("/mypage")
    public ResponseEntity getUser(Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        User user = userService.findUser(principal.getUserId());

        return new ResponseEntity<>(new SingleResponseDto<>(userMapper.userToResponseDto(user)), HttpStatus.OK);
    }
    @GetMapping
    public ResponseEntity getUsers(@RequestParam @Positive int page,
                                   @RequestParam @Positive int size,
                                   Authentication authentication) {
        Page<User> users = userService.getUsers(page, size, authentication);

        return ResponseEntity.ok(users);
    }
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailDuplicate(@RequestParam String email) {
        boolean isDuplicate = userService.verifiedExistEmail(email);

        return ResponseEntity.ok(isDuplicate);
    }
    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickNameDuplicate(@RequestParam String nickName) {
        boolean isDuplicate = userService.verifiedExistNickname(nickName);

        return ResponseEntity.ok(isDuplicate);
    }
    @DeleteMapping("{user-id}")
    public ResponseEntity deleteUser(@PathVariable("user-id") @Positive long userId,
                                     Authentication authentication) {
        userService.deleteMember(userId, authentication);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
