package com.deepu.taskmanager.service;

import com.deepu.taskmanager.config.JwtUtil;
import com.deepu.taskmanager.dto.LoginRequest;
import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.deepu.taskmanager.repository.CompanyRepository companyRepository;

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

    @Transactional
    public String register(com.deepu.taskmanager.dto.RegisterRequest request) {
        try {
            if (emailExists(request.getEmail())) {
                throw new RuntimeException("Email '" + request.getEmail() + "' is already registered.");
            }

            if (request.getCompanyName() == null || request.getCompanyName().trim().isEmpty()) {
                throw new RuntimeException("Organization name is required.");
            }

            // Create new company for the user
            com.deepu.taskmanager.entity.Company company = companyRepository.findByName(request.getCompanyName())
                    .orElseGet(() -> {
                        com.deepu.taskmanager.entity.Company newComp = new com.deepu.taskmanager.entity.Company(request.getCompanyName());
                        return companyRepository.save(newComp);
                    });

            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(encoder.encode(request.getPassword()));
            user.setRole("ADMIN"); // First user of a company is always ADMIN
            user.setCompany(company);
            user.setPerformanceScore(0);
            user.setStreak(0);
            user.setLongestStreak(0);

            userRepository.save(user);

            return jwtUtil.generateToken(user.getEmail(), user.getRole());
        } catch (Exception e) {
            System.err.println("Registration failed: " + e.getMessage());
            e.printStackTrace(); 
            throw new RuntimeException(e.getMessage());
        }
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
