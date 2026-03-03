package org.example.licenta.application.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class AddAvailabilityRequest {
    private LocalDate date;
    private List<UUID> timeSlotIds;
}