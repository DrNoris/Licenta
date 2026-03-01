package org.example.licenta.presentation;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.request.LoginRequest;
import org.example.licenta.application.dto.request.RegisterRequest;
import org.example.licenta.application.dto.response.AuthResponse;
import org.example.licenta.application.service.AuthService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me/role")
    public String getMyRole(Authentication authentication) {
        return authentication.getAuthorities()
                .iterator().next()
                .getAuthority(); // returns "ROLE_USER" or "ROLE_ADMIN"
    }
}