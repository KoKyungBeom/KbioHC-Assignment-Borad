package com.springboot.exception;

import lombok.Getter;

public enum ExceptionCode {
    INVALID_AUTHENTICATION_CODE(400, "Invalid Authentication Code"),
    SEARCH_CRITERIA_REQUIRED(400, "Please select a search criterion."),
    SEARCH_KEYWORD_REQUIRED(400, "Please enter a search keyword."),
    INVALID_SEARCH_CRITERIA(400, "Invalid search criterion."),
    AUTHENTICATION_FAILED(401, "Invalid verification code"),
    ACCESS_DENIED(403,"Access Denied"),
    USER_NOT_FOUND(404,"User Not Found"),
    POST_NOT_FOUND(404,"Post Not Found"),
    COMMENT_NOT_FOUND(404,"Comment Not Found"),
    FILE_NOT_FOUND(404,"File Not Found"),
    EMAIL_ALREADY_EXIST(409, "Email Already Exist"),
    NICKNAME_ALREADY_EXIST(409, "Nickname Already Exist");

    @Getter
    private int status;
    @Getter
    private String message;

    ExceptionCode (int status, String message) {
        this.status = status;
        this.message = message;
    }
}
