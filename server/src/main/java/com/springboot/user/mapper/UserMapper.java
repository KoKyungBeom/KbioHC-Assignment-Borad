package com.springboot.user.mapper;

import com.springboot.user.dto.UserDto;
import com.springboot.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User userPostDtoToUser(UserDto.Post postDto);
    UserDto.Response userToResponseDto(User user);
}
