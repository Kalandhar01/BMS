package com.bookmyshow.user.controller;

import com.bookmyshow.user.dto.LoginRequest;
import com.bookmyshow.user.dto.LoginResponse;
import com.bookmyshow.user.dto.RegisterRequest;
import com.bookmyshow.user.entity.User;
import com.bookmyshow.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService service;

    public AuthController(UserService s) {
        this.service = s;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest r) {
        return ResponseEntity.ok(service.register(r));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest r) {
        return ResponseEntity.ok(service.login(r));
    }

    @GetMapping("/profile")
    public ResponseEntity<User> profile(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.getProfile(userId));
    }

    @PutMapping("/profile/update")
    public ResponseEntity<User> updateProfile(Authentication auth,
                                               @RequestBody Map<String, String> updates) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.updateProfile(userId, updates));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(Authentication auth,
                                                               @RequestBody Map<String, String> body) {
        Long userId = (Long) auth.getCredentials();
        service.changePassword(userId, body.get("oldPassword"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> bookings(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.getBookings(userId));
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestBody Map<String, String> body) {
        boolean valid = service.validateToken(body.get("token"));
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}
