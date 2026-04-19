package org.example.licenta.application.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class BookingResponse {
    private String id;
    private Double totalPrice;
    private String status;
    private ParkingSpotResponse parkingSpot;
    private String date;
    private List<TimeSlotResponse> slots;
}