package org.example.licenta.application.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ParkingSpotResponse {
    private String id;
    private String address;
    private String description;
    private Double pricePerHour;
    private Double latitude;
    private Double longitude;
    private List<String> imagePublicIds;
    private boolean availableNow;
}