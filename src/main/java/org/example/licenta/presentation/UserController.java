package org.example.licenta.presentation;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}/name")
    public ResponseEntity<String> getUserName(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUserName(userId));
    }
}
