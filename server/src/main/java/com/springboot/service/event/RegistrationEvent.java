package com.springboot.service.event;

import com.springboot.user.entity.User;
import lombok.Getter;

@Getter
public class RegistrationEvent {
    private final User user;

    public RegistrationEvent(User user) {
        this.user = user;
    }
}
