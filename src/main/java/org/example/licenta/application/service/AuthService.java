package org.example.licenta.application.service;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.mapper.UserMapper;
import org.example.licenta.application.dto.request.LoginRequest;
import org.example.licenta.application.dto.request.RegisterRequest;
import org.example.licenta.application.dto.response.AuthResponse;
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

    private final UserMapper userMapper;

    public AuthResponse register(RegisterRequest request) {

        User user = userMapper.toEntity(request);
       // user.setRole(Role.USER);
//        user.setEnabled(false);

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

        return AuthResponse.builder().token(token).build();
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

//        if (!user.isEnabled()) {
//            throw new RuntimeException("User not activated");
//        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(
                user.getId().toString(),
                user.getRole().name()
        );

        return AuthResponse.builder().token(token).build();
    }
}