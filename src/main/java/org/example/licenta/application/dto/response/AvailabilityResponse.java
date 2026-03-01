package org.example.licenta.application.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AvailabilityResponse {
    private LocalDate date;
    private List<TimeSlotResponse> availableSlots;
}