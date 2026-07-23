package com.bookmyshow.user.service.impl;

import com.bookmyshow.user.client.BookingServiceClient;
import com.bookmyshow.user.dto.LoginRequest;
import com.bookmyshow.user.dto.LoginResponse;
import com.bookmyshow.user.dto.RegisterRequest;
import com.bookmyshow.user.entity.User;
import com.bookmyshow.user.repository.UserRepository;
import com.bookmyshow.user.security.JwtUtil;
import com.bookmyshow.user.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final BookingServiceClient bookingClient;

    public UserServiceImpl(UserRepository r, PasswordEncoder e, JwtUtil j, BookingServiceClient bc) {
        this.repo = r;
        this.encoder = e;
        this.jwtUtil = j;
        this.bookingClient = bc;
    }

    @Override
    public User register(RegisterRequest r) {
        User u = new User();
        u.setName(r.getName());
        u.setEmail(r.getEmail());
        u.setMobile(r.getMobile());
        u.setPassword(encoder.encode(r.getPassword()));
        u.setCreatedAt(LocalDateTime.now());
        return repo.save(u);
    }

    @Override
    public LoginResponse login(LoginRequest r) {
        User user = repo.findByEmail(r.getEmail());
        if (user == null || !encoder.matches(r.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new LoginResponse(token, user.getEmail(), user.getName(), user.getId());
    }

    @Override
    public User getProfile(Long userId) {
        return repo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateProfile(Long userId, Map<String, String> updates) {
        User u = repo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (updates.containsKey("name")) u.setName(updates.get("name"));
        if (updates.containsKey("mobile")) u.setMobile(updates.get("mobile"));
        if (updates.containsKey("email")) u.setEmail(updates.get("email"));
        return repo.save(u);
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User u = repo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (!encoder.matches(oldPassword, u.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        u.setPassword(encoder.encode(newPassword));
        repo.save(u);
    }

    @Override
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    @Override
    public List<Map<String, Object>> getBookings(Long userId) {
        try {
            return bookingClient.getUserBookings(userId);
        } catch (Exception e) {
            System.err.println("Failed to fetch bookings: " + e.getMessage());
            return List.of();
        }
    }
}
