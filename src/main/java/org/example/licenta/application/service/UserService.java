package org.example.licenta.application.service;

import lombok.RequiredArgsConstructor;
import org.example.licenta.infrastructure.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.example.licenta.domain.model.User;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public String getUserName(UUID userId) {
        return userRepository.findById(userId)
                .map(User::getUsername)
                .orElse("Utilizator");
    }
}
