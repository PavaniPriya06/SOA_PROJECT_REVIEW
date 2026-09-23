package com.bidsphere.authservice.service;

import com.bidsphere.authservice.dto.AuthResponse;
import com.bidsphere.authservice.dto.LoginRequest;
import com.bidsphere.authservice.dto.RegisterRequest;
import com.bidsphere.authservice.dto.UserResponse;
import com.bidsphere.authservice.entity.Role;
import com.bidsphere.authservice.entity.User;
import com.bidsphere.authservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Proxy;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void passwordHashing_shouldMatch() {
        String rawPassword = "Password123";
        String encoded = passwordEncoder.encode(rawPassword);

        assertTrue(passwordEncoder.matches(rawPassword, encoded));
        assertNotEquals(rawPassword, encoded);
    }

    @Test
    void register_shouldCreateUser() {
        UserRepository repository = repositoryReturning(null, false);
        AuthService authService = new AuthService(repository, passwordEncoder, new JwtService());

        RegisterRequest request = new RegisterRequest("Phani", "phani@gmail.com", "Password123", Role.BUYER);

        User saved = authService.register(request);

        assertNotNull(saved);
        assertEquals("Phani", saved.getName());
        assertEquals("phani@gmail.com", saved.getEmail());
        assertTrue(passwordEncoder.matches("Password123", saved.getPassword()));
        assertEquals(Role.BUYER, saved.getRole());
    }

    @Test
    void register_shouldRejectDuplicateEmail() {
        UserRepository repository = repositoryReturning(null, true);
        AuthService authService = new AuthService(repository, passwordEncoder, new JwtService());

        RegisterRequest request = new RegisterRequest("Phani", "phani@gmail.com", "Password123", Role.BUYER);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.register(request));

        assertEquals("Email already registered", exception.getMessage());
    }

    @Test
    void login_shouldReturnTokenAndUserData() {
        User user = user("phani@gmail.com", "Password123", Role.BUYER, 1L);
        UserRepository repository = repositoryReturning(user, false);
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "changeThisSecretKeyForBidSphere2026!!!");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 86400000L);

        AuthService authService = new AuthService(repository, passwordEncoder, jwtService);

        AuthResponse response = authService.login(new LoginRequest("phani@gmail.com", "Password123"));

        assertNotNull(response);
        assertEquals("phani@gmail.com", response.getEmail());
        assertEquals(Role.BUYER, response.getRole());
        assertNotNull(response.getToken());
    }

    @Test
    void login_shouldRejectInvalidPassword() {
        User user = user("phani@gmail.com", "Password123", Role.BUYER, 1L);
        UserRepository repository = repositoryReturning(user, false);
        AuthService authService = new AuthService(repository, passwordEncoder, new JwtService());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.login(new LoginRequest("phani@gmail.com", "WrongPassword")));

        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void jwtGeneration_shouldGenerateAndValidateToken() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "changeThisSecretKeyForBidSphere2026!!!");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 86400000L);

        User user = user("phani@gmail.com", "Password123", Role.BUYER, 1L);
        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertTrue(jwtService.validateToken(token));
        assertEquals(1L, jwtService.getUserId(token));
        assertEquals("phani@gmail.com", jwtService.getEmail(token));
        assertEquals(Role.BUYER, jwtService.getRole(token));
    }

    @Test
    void jwtValidation_shouldFailForInvalidToken() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "changeThisSecretKeyForBidSphere2026!!!");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 86400000L);

        assertFalse(jwtService.validateToken("not-a-valid-jwt-token"));
    }

    @Test
    void getCurrentUser_shouldReturnUserResponse() {
        User user = user("phani@gmail.com", "Password123", Role.BUYER, 1L);
        UserRepository repository = repositoryReturning(user, false);
        AuthService authService = new AuthService(repository, passwordEncoder, new JwtService());

        UserResponse response = authService.getCurrentUser("phani@gmail.com");

        assertNotNull(response);
        assertEquals(1L, response.getUserId());
        assertEquals("Phani", response.getName());
        assertEquals("phani@gmail.com", response.getEmail());
        assertEquals(Role.BUYER, response.getRole());
    }

    private UserRepository repositoryReturning(User user, boolean duplicate) {
        return (UserRepository) Proxy.newProxyInstance(
                UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class},
                (proxy, method, args) -> {
                    String methodName = method.getName();
                    if ("existsByEmail".equals(methodName)) {
                        return duplicate;
                    }
                    if ("findByEmail".equals(methodName)) {
                        String email = (String) args[0];
                        if (user != null && user.getEmail().equals(email)) {
                            return Optional.of(user);
                        }
                        return Optional.empty();
                    }
                    if ("save".equals(methodName)) {
                        User incoming = (User) args[0];
                        incoming.setId(1L);
                        incoming.setCreatedAt(LocalDateTime.now());
                        return incoming;
                    }
                    if ("findById".equals(methodName)) {
                        return Optional.ofNullable(user);
                    }
                    return null;
                }
        );
    }

    private User user(String email, String rawPassword, Role role, Long id) {
        User user = new User();
        user.setId(id);
        user.setName("Phani");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }
}
