package com.deepu.taskmanager.controller;

import com.deepu.taskmanager.dto.LoginRequest;
import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.service.AuthService;
import com.deepu.taskmanager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    // Register endpoint - allows creating users without authentication
    // Useful for creating the first admin user when no admin exists
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody com.deepu.taskmanager.dto.RegisterRequest request) {
        try {
            String token = authService.register(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Registration successful!",
                    "token", token
            ));
        } catch (Exception e) {
            e.printStackTrace(); // Log the error in terminal
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }



    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String response = authService.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            String newPassword = request.get("newPassword");
            String response = authService.resetPassword(email, otp, newPassword);
            return ResponseEntity.ok(Map.of("message", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
