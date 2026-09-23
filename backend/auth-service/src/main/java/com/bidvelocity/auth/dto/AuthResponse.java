package com.bidvelocity.auth.dto;

public class AuthResponse {

    private String token;
    private Long userId;
    private String username;
    private String email;
    private String role;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserView user) {
        this.token = token;
        this.userId = user.id();
        this.username = user.username();
        this.email = user.email();
        this.role = user.role();
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }

    public record UserView(Long id, String username, String email, String role) {
    }
}
