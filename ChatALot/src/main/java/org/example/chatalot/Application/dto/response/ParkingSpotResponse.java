package org.example.chatalot.Application.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class ParkingSpotResponse {
        private UUID ownerId;
        private String ownerName;
        private String spotAddress;
}