package org.example.licenta.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotResponse implements Serializable {
    private String id;
    private Integer startHour;
    private Integer endHour;
}
