package org.example.licenta.application.service;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.mapper.UserMapper;
import org.example.licenta.application.dto.request.LoginRequest;
import org.example.licenta.application.dto.request.RegisterRequest;
import org.example.licenta.application.dto.response.AuthResponse;
import org.example.licenta.domain.model.*;
import org.example.licenta.infrastructure.repository.UserRepository;
import org.example.licenta.infrastructure.repository.VerificationTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenRepository verificationTokenRepository;

    private final EmailService emailService;

    private final UserMapper userMapper;

    public void register(RegisterRequest request) {
        User user = userMapper.toEntity(request);

        try {
            userRepository.save(user);
            sendEmailConfirmation(user);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isActivated()){
            Optional<VerificationToken> optionalVerificationToken = verificationTokenRepository.findByUser(user);
            boolean exists = optionalVerificationToken.isPresent();

            if (!exists) {
                userRepository.delete(user);

                throw new RuntimeException("User not found");
            }

            VerificationToken verificationToken = optionalVerificationToken.get();
            if (verificationToken.getExpirationDate().before(new Date())) {
                userRepository.delete(verificationToken.getUser());
                verificationTokenRepository.delete(verificationToken);

                throw new IllegalArgumentException("Token expired");
            }

            throw new RuntimeException("User not activated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String JWTToken = jwtService.generateToken(
                user.getId().toString(),
                user.getRole().name()
        );

        return AuthResponse.builder().token(JWTToken).build();
    }

    public AuthResponse verifyEmail(String verificationTokenString){
        VerificationToken verificationToken = verificationTokenRepository.findByToken(verificationTokenString).orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (verificationToken.getExpirationDate().before(new Date())) {
            userRepository.delete(verificationToken.getUser());
            verificationTokenRepository.delete(verificationToken);

            throw new IllegalArgumentException("Token expired");
        }

        User user = verificationToken.getUser();
        user.setActivated(true);
        userRepository.save(user);
        verificationTokenRepository.delete(verificationToken);

        String JWTToken = jwtService.generateToken(
                user.getId().toString(),
                user.getRole().name()
        );

        return AuthResponse.builder().token(JWTToken).build();
    }

    private void sendEmailConfirmation(User user){
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .build();

        verificationTokenRepository.save(verificationToken);
        emailService.sendVerificationEmail(user.getEmail(), token);
    }
}