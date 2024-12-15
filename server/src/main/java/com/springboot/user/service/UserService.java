package com.springboot.user.service;

import com.springboot.auth.utils.JwtAuthorityUtils;
import com.springboot.auth.utils.Principal;
import com.springboot.exception.BusinessLogicException;
import com.springboot.exception.ExceptionCode;
import com.springboot.redis.RedisUtil;
import com.springboot.service.email.VerificationDto;
import com.springboot.service.event.RegistrationEvent;
import com.springboot.user.entity.User;
import com.springboot.user.repository.UserRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtAuthorityUtils jwtAuthorityUtils;
    private final RedisUtil redisUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ApplicationEventPublisher publisher;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtAuthorityUtils jwtAuthorityUtils, RedisUtil redisUtil, RedisTemplate<String, Object> redisTemplate, ApplicationEventPublisher publisher) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtAuthorityUtils = jwtAuthorityUtils;
        this.redisUtil = redisUtil;
        this.redisTemplate = redisTemplate;
        this.publisher = publisher;
    }
    //유저를 생성하기위해 이벤트를 발급하는 메서드
    public void createUser(User user) {
        verifiedExistEmail(user.getEmail());
        verifiedExistNickname(user.getNickname());

        String key = user.getEmail() + ":email";
        redisUtil.setHashValueWithExpire(key, "userInfo", user, 600);
        publisher.publishEvent(new RegistrationEvent(user));
    }
    //메일 인증이 끝난 유저를 생성하는 메서드
    public User registerUser(VerificationDto verificationDto) {
        String key = verificationDto.getEmail() + ":email";
        User user = redisUtil.getHashValue(key, "userInfo", User.class);
        if (user == null) {
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }
        //redis에서 user삭제
        redisTemplate.delete(key);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        List<String> roles = jwtAuthorityUtils.createRoles(user.getEmail());
        user.setRoles(roles);

        return userRepository.save(user);
    }
    //userId로 유저를 찾는 메서드
    public User findUser(long userId) {
        return findVerifiedUser(userId);
    }
    //모든 user를 찾는 메서드
    public Page<User> getUsers(int page, int size, Authentication authentication) {
        List roles = (List) authentication.getAuthorities();

        if (!roles.contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC,"createdAt"));

        return userRepository.findAll(pageable);
    }
    //userId로 유효한 사용자 인지 검증하는 메서드
    private User findVerifiedUser(long userId) {
        Optional<User> user = userRepository.findById(userId);

        return user.orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
    }
    //email 중복을 검증하는 메서드
    public boolean verifiedExistEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new BusinessLogicException(ExceptionCode.EMAIL_ALREADY_EXIST);
        }

        return false;
    }
    //닉네임 중복을 검증하는 메서드
    public boolean verifiedExistNickname(String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            throw new BusinessLogicException(ExceptionCode.NICKNAME_ALREADY_EXIST);
        }

        return false;
    }
    //email을 통해 유저를 찾는 메서드
    public User findUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        return user;
    }
    //유저를 삭제하는 메서드(유저 상태를 변경)
    public void deleteMember(long userId, Authentication authentication) {
        Principal principal = (Principal) authentication.getPrincipal();

        User user = findUser(userId);

        if (userId != principal.getUserId()) {
            throw new BusinessLogicException(ExceptionCode.ACCESS_DENIED);
        }
        user.setUserStatus(User.UserStatus.QUIT);

        userRepository.save(user);
    }
}
