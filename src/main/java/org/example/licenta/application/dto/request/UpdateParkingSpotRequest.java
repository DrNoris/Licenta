package org.example.licenta.application.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class UpdateParkingSpotRequest {
    private String description;
    private Double pricePerHour;
    private Double pricePerDay;
    private List<String> publicIdsToDelete;
}