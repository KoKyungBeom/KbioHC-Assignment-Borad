package com.springboot.auth.utils;

import com.google.gson.Gson;
import com.springboot.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ErrorResponder {
    public static void sendErrorResponse(HttpServletResponse response,
                                         HttpStatus httpStatus,
                                         String message) throws IOException {
        Gson gson = new Gson();
        ErrorResponse errorResponse = ErrorResponse.of(httpStatus, message);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(httpStatus.value());
        response.getWriter().write(gson.toJson(errorResponse,ErrorResponse.class));
    }
}