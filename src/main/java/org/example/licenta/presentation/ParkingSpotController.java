package org.example.licenta.presentation;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.request.AddAvailabilityRequest;
import org.example.licenta.application.dto.request.CreateParkingSpotRequest;
import org.example.licenta.application.dto.response.AvailabilityResponse;
import org.example.licenta.application.dto.response.ParkingSpotResponse;
import org.example.licenta.application.service.ParkingSpotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/parking-spot")
@RequiredArgsConstructor
public class ParkingSpotController {
    private final ParkingSpotService parkingSpotService;

    @GetMapping
    public List<ParkingSpotResponse> getAllSpots(){
        return parkingSpotService.getAllSpots();
    }

    @GetMapping("/my")
    public List<ParkingSpotResponse> getAllSpots(Authentication authentication){
        UUID ownerId = UUID.fromString(authentication.getName());

        return parkingSpotService.getAllSpots(ownerId);
    }

    @PostMapping
    public ResponseEntity<ParkingSpotResponse> createParkingSpot(@RequestBody CreateParkingSpotRequest createParkingSpotRequest, Authentication authentication) {
        UUID ownerId = UUID.fromString(authentication.getName());
        ParkingSpotResponse response = parkingSpotService.createParkingSpot(createParkingSpotRequest, ownerId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{parkingSpotId}/availability")
    public ResponseEntity<Void> createParkingSpotAvailability(@PathVariable Long parkingSpotId, @RequestBody AddAvailabilityRequest addAvailabilityRequest, Authentication authentication){
        UUID ownerId = UUID.fromString(authentication.getName());
        parkingSpotService.createParkingSpotAvailability(parkingSpotId, addAvailabilityRequest, ownerId);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{spotId}/availability")
    public AvailabilityResponse getAvailability(@PathVariable String spotId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return parkingSpotService.getAvailability(UUID.fromString(spotId), date);
    }
}
