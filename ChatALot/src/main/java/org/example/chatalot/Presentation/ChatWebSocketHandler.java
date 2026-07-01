package org.example.chatalot.Presentation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.chatalot.Application.dto.response.MessageResponse;
import org.example.chatalot.Application.service.ChatService;
import org.example.chatalot.Application.service.JwtService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatService chatService;

    private final JwtService jwtUtil;
    private final ObjectMapper objectMapper;

    private final Map<String, Set<WebSocketSession>> rooms =
            new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String conversationId = extractConversationId(session);
        if (conversationId == null) {
            closeSession(session);
            return;
        }

        String token = extractToken(session);
        if (token == null || !jwtUtil.isValid(token)) {
            closeSession(session);
            return;
        }

        session.getAttributes().put("conversationId", conversationId);
        session.getAttributes().put("userId", jwtUtil.extractUserId(token));
        session.getAttributes().put("userName", jwtUtil.extractUserName(token));

        rooms.computeIfAbsent(conversationId, k -> ConcurrentHashMap.newKeySet())
                .add(session);

        log.info("WS connected: user={} conversation={}",
                jwtUtil.extractUserId(token), conversationId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String conversationId = (String) session.getAttributes().get("conversationId");
        UUID userId = UUID.fromString((String) session.getAttributes().get("userId"));
        String userName = (String) session.getAttributes().get("userName");

        Map<?, ?> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String content = (String) payload.get("content");

        if (content == null || content.isBlank()) return;

        MessageResponse saved = chatService.saveMessage(
                UUID.fromString(conversationId), userId, userName, content
        );

        String json = objectMapper.writeValueAsString(saved);
        Set<WebSocketSession> sessions = rooms.getOrDefault(conversationId, Set.of());
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(json));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String conversationId = (String) session.getAttributes().get("conversationId");
        if (conversationId != null) {
            Set<WebSocketSession> sessions = rooms.get(conversationId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) rooms.remove(conversationId);
            }
        }
    }

    private String extractConversationId(WebSocketSession session) {
        try {
            URI uri = session.getUri();
            if (uri == null) return null;
            String path = uri.getPath();
            String[] parts = path.split("/");
            return parts[parts.length - 1];
        } catch (Exception e) {
            return null;
        }
    }

    private String extractToken(WebSocketSession session) {
        try {
            URI uri = session.getUri();
            if (uri == null) return null;
            String query = uri.getQuery();
            if (query == null) return null;
            for (String param : query.split("&")) {
                if (param.startsWith("token=")) {
                    return param.substring(6);
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private void closeSession(WebSocketSession session) {
        try { session.close(CloseStatus.NOT_ACCEPTABLE); }
        catch (Exception ignored) {}
    }
}