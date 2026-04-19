package org.example.chatalot.Application.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MessageResponse {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String senderName;
    private String content;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
}