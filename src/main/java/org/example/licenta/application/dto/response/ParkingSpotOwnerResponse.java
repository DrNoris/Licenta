package org.example.licenta.application.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class ParkingSpotOwnerResponse {
    private UUID ownerId;
    private String ownerName;
    private String spotAddress;
}