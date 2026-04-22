package org.example.chatalot.Presentation;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.chatalot.Application.dto.request.CreateConversationRequest;
import org.example.chatalot.Application.dto.response.ConversationResponse;
import org.example.chatalot.Application.dto.response.MessageResponse;
import org.example.chatalot.Application.service.ChatService;
import org.example.chatalot.Application.service.JwtService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final JwtService jwtService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(
            Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(chatService.getConversations(userId));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> getOrCreate(
            @RequestBody CreateConversationRequest req,
            Authentication authentication,
            HttpServletRequest request
    ) {
        UUID requesterId = UUID.fromString(authentication.getName());
        String token = request.getHeader("Authorization").substring(7);
        String requesterName = jwtService.extractUserName(token);

        return ResponseEntity.ok(chatService.getOrCreateConversation(req, requesterId, requesterName));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<Page<MessageResponse>> getMessages(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(
                chatService.getMessages(id, userId,
                        PageRequest.of(page, size, Sort.by("sentAt").descending()))
        );
    }

    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        chatService.markAsRead(id, UUID.fromString(authentication.getName()));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(Map.of("count", chatService.getUnreadCount(userId)));
    }
}