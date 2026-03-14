package org.example.licenta.application.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ParkingSpotSlotResponse {
    private UUID id;
    private LocalDate date;
    private UUID parkingSpotId;
    private UUID timeSlotId;
    private UUID bookingId;
}