package org.example.licenta.application.dto.response;

import lombok.Data;
import java.io.Serializable;

@Data
public class TimeSlotResponse implements Serializable {
    private String id;
    private Integer startHour;
    private Integer endHour;
}
