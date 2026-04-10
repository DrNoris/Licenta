package org.example.chatalot.Application.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class CreateConversationRequest {
    private UUID parkingSpotId;
    private UUID sellerId;
}