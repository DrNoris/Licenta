package org.example.licenta.application.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreateParkingSpotRequest {
    private String description;
    private Double pricePerHour;
    private Double pricePerDay;
    private Double latitude;
    private Double longitude;
    private List<String> imageUrls;
}
