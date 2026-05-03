package com.deepu.taskmanager.service;

import com.deepu.taskmanager.config.JwtUtil;
import com.deepu.taskmanager.dto.LoginRequest;
import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Autowired
    private EmailService emailService;

    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole());
    }

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        
        user.setResetOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send Email
        try {
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }

        return "OTP sent to your email successfully.";
    }

    public String resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Reset password
        user.setPassword(encoder.encode(newPassword));
        user.setResetOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return "Password reset successfully.";
    }
}
