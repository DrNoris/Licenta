package org.example.licenta.application.dto.request;

import lombok.Data;

@Data
public class CreateParkingSpotRequest {
    private String description;
    private String address;
    private Double pricePerHour;
    private Double latitude;
    private Double longitude;
}
