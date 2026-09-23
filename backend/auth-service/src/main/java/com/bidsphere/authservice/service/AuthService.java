package com.bidsphere.authservice.service;

import com.bidsphere.authservice.dto.AuthResponse;
import com.bidsphere.authservice.dto.LoginRequest;
import com.bidsphere.authservice.dto.RegisterRequest;
import com.bidsphere.authservice.dto.UserResponse;
import com.bidsphere.authservice.entity.Role;
import com.bidsphere.authservice.entity.User;
import com.bidsphere.authservice.repository.UserRepository;
import com.bidsphere.authservice.repository.RefreshTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    // Backwards-compatible constructor for tests and subclasses that don't provide a refresh repository.
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this(userRepository, passwordEncoder, jwtService, null);
    }

    public User register(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        String name = normalizeText(request.getName());
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();
        Role role = request.getRole();

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (email == null || email.isBlank() || !email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

        if (role == null || (!role.equals(Role.BUYER) && !role.equals(Role.SELLER))) {
            throw new IllegalArgumentException("Role must be BUYER or SELLER");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Login request is required");
        }

        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        // generate refresh token (longer expiry)
        long refreshMs = jwtService.getExpirationMs() * 7; // one week by default
        String refreshToken = jwtService.generateRefreshToken(user, refreshMs);

        // persist refresh token when repository is available (optional)
        if (refreshTokenRepository != null) {
            com.bidsphere.authservice.entity.RefreshToken rt = new com.bidsphere.authservice.entity.RefreshToken();
            rt.setToken(refreshToken);
            rt.setUser(user);
            rt.setExpiresAt(java.time.Instant.now().plusMillis(refreshMs));
            refreshTokenRepository.save(rt);
        }

        AuthResponse resp = new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
        resp.setRefreshToken(refreshToken);
        return resp;
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        if (!jwtService.validateToken(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        // if repository is present, ensure token exists in DB and not expired
        if (refreshTokenRepository != null) {
            com.bidsphere.authservice.entity.RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                    .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));
            if (stored.getExpiresAt().isBefore(java.time.Instant.now())) {
                refreshTokenRepository.deleteByToken(refreshToken);
                throw new IllegalArgumentException("Refresh token expired");
            }
        }

        String email = jwtService.getEmail(refreshToken);
        User user = findByEmail(email);

        // Issue new tokens; revoke old refresh token when repository exists
        if (refreshTokenRepository != null) {
            refreshTokenRepository.deleteByToken(refreshToken);
        }

        String newAccess = jwtService.generateToken(user);
        long refreshMs = jwtService.getExpirationMs() * 7; // refresh token lifetime unchanged
        String newRefresh = jwtService.generateRefreshToken(user, refreshMs);

        if (refreshTokenRepository != null) {
            com.bidsphere.authservice.entity.RefreshToken newRt = new com.bidsphere.authservice.entity.RefreshToken();
            newRt.setToken(newRefresh);
            newRt.setUser(user);
            newRt.setExpiresAt(java.time.Instant.now().plusMillis(refreshMs));
            refreshTokenRepository.save(newRt);
        }

        AuthResponse resp = new AuthResponse(newAccess, user.getId(), user.getName(), user.getEmail(), user.getRole());
        resp.setRefreshToken(newRefresh);
        return resp;
    }

    public void revokeRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        if (refreshTokenRepository != null) {
            refreshTokenRepository.deleteByToken(refreshToken);
        }
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private String normalizeText(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeEmail(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}
