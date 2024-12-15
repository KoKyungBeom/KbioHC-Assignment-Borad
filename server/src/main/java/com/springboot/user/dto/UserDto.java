package com.springboot.user.dto;

import com.springboot.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import java.time.LocalDateTime;

public class UserDto {
    @Builder
    @Getter
    public static class Post {
        @NotBlank
        @Email
        private String email;

        @NotBlank(message = "닉네임은 공백이 아니어야 합니다.")
        @Pattern(regexp = "^[a-zA-Z0-9가-힣]{2,10}$",
                message = "닉네임은 2~10글자 이내만 가능합니다.")
        private String nickname;

        @NotBlank
        @Pattern(regexp = "(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\\W)(?=\\S+$).{10,20}",
                message = "비밀번호는 대소문자/숫자와 특수기호가 적어도 1개 이상씩 포함된 10자 이상의 비밀번호여야 합니다.")
        private String password;
    }
    @Builder
    @Getter
    public static class Response {
        private long userId;
        private String email;
        private String nickname;
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;
        private User.UserStatus userStatus;
    }
}
