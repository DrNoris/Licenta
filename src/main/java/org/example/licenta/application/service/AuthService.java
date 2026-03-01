package org.example.licenta.application.service;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.*;
import org.example.licenta.domain.model.*;
import org.example.licenta.infrastructure.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {

        User user = new User();
        user.setUsername(request.username);
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setRole(Role.USER);
        user.setEnabled(false);

        try {
            userRepository.save(user);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
        String token = jwtService.generateToken(
                user.getId().toString(),
                user.getRole().name()
        );

        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEnabled()) {
            throw new RuntimeException("User not activated");
        }

        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(
                user.getId().toString(),
                user.getRole().name()
        );

        return new AuthResponse(token);
    }
}