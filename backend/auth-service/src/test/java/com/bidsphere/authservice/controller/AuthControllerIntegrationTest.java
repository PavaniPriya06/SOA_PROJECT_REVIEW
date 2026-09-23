package com.bidsphere.authservice.controller;

import com.bidsphere.authservice.dto.AuthResponse;
import com.bidsphere.authservice.dto.RegisterRequest;
import com.bidsphere.authservice.dto.UserResponse;
import com.bidsphere.authservice.entity.Role;
import com.bidsphere.authservice.service.AuthService;
import com.bidsphere.authservice.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import java.util.Objects;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerIntegrationTest {
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private JwtService jwtService;
    private AuthService authService;

    @BeforeEach
    void setup() {
        this.jwtService = new JwtService();
        ReflectionTestUtils.setField(this.jwtService, "secret", "changeThisSecretKeyForBidSphere2026!!!");
        ReflectionTestUtils.setField(this.jwtService, "expirationMs", 86400000L);

        this.authService = new StaticAuthService(new BCryptPasswordEncoder(), this.jwtService);
        mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(this.authService)).build();
    }

    @Test
    void register_shouldReturnSuccessMessage() throws Exception {
        RegisterRequest request = new RegisterRequest("Phani", "phani@gmail.com", "Password123", Role.BUYER);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(request))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful"));
    }

    @Test
    void login_shouldReturnToken() throws Exception {
        String json = "{\"email\":\"phani@gmail.com\",\"password\":\"Password123\"}";

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(Objects.requireNonNull(json)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("phani@gmail.com"));
    }

    @Test
    void refresh_shouldReturnNewToken() throws Exception {
        RegisterRequest request = new RegisterRequest("Phani", "phani@gmail.com", "Password123", Role.BUYER);
        // register user via service to get stable user
        com.bidsphere.authservice.entity.User user = authService.register(request);

        long refreshMs = 86400000L * 7;
        String refreshToken = jwtService.generateRefreshToken(user, refreshMs);

        String payload = objectMapper.writeValueAsString(java.util.Map.of("refreshToken", refreshToken));

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.userId").value(1));
    }

    @Test
    void me_shouldReturnCurrentUser() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("phani@gmail.com", null)
        );

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.name").value("Phani"))
                .andExpect(jsonPath("$.email").value("phani@gmail.com"))
                .andExpect(jsonPath("$.role").value("BUYER"));

        SecurityContextHolder.clearContext();
    }

    static class StaticAuthService extends AuthService {
        StaticAuthService(PasswordEncoder passwordEncoder, JwtService jwtService) {
            super(null, passwordEncoder, jwtService);
        }

        @Override
        public com.bidsphere.authservice.entity.User register(RegisterRequest request) {
            com.bidsphere.authservice.entity.User user = new com.bidsphere.authservice.entity.User();
            user.setId(1L);
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword("encoded-password");
            user.setRole(request.getRole());
            return user;
        }

        @Override
        public AuthResponse login(com.bidsphere.authservice.dto.LoginRequest request) {
            return new AuthResponse("jwt-token", 1L, "Phani", request.getEmail(), Role.BUYER);
        }

        @Override
        public UserResponse getCurrentUser(String email) {
            return new UserResponse(1L, "Phani", email, Role.BUYER);
        }

        @Override
        public com.bidsphere.authservice.entity.User findByEmail(String email) {
            com.bidsphere.authservice.entity.User user = new com.bidsphere.authservice.entity.User();
            user.setId(1L);
            user.setName("Phani");
            user.setEmail(email);
            user.setPassword("encoded-password");
            user.setRole(Role.BUYER);
            return user;
        }
    }
}
