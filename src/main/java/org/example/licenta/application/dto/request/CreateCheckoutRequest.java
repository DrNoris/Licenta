package org.example.licenta.application.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class CreateCheckoutRequest {
    private String parkingSpotId;
    private String date;
    private List<String> timeSlotIds;
}
