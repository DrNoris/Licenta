package org.example.chatalot.Application.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ConversationResponse {
    private UUID id;
    private UUID parkingSpotId;
    private String parkingSpotAddress;
    private UUID otherUserId;
    private String otherUserName;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}