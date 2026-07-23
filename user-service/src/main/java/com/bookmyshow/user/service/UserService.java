package com.bookmyshow.user.service;

import com.bookmyshow.user.dto.LoginRequest;
import com.bookmyshow.user.dto.LoginResponse;
import com.bookmyshow.user.dto.RegisterRequest;
import com.bookmyshow.user.entity.User;
import java.util.List;
import java.util.Map;

public interface UserService {
    User register(RegisterRequest r);
    LoginResponse login(LoginRequest r);
    User getProfile(Long userId);
    User updateProfile(Long userId, Map<String, String> updates);
    void changePassword(Long userId, String oldPassword, String newPassword);
    boolean validateToken(String token);
    List<Map<String, Object>> getBookings(Long userId);
}
