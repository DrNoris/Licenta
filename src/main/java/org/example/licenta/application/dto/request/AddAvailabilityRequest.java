package org.example.licenta.application.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AddAvailabilityRequest {
    private LocalDate date;
    private List<Long> timeSlotIds;
}