package org.example.licenta.application.dto.response;

import lombok.Data;

@Data
public class TimeSlotResponse {
    private String id;
    private Integer startHour;
    private Integer endHour;
}
