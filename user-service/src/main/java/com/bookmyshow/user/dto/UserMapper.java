package com.bookmyshow.user.dto;

import com.bookmyshow.user.entity.User;

public class UserMapper {

    public static UserResponse toResponse(User u) {
        if (u == null) return null;
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setName(u.getName());
        r.setEmail(u.getEmail());
        r.setMobile(u.getMobile());
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }
}
