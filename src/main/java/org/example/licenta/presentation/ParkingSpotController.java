package org.example.licenta.presentation;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.request.CreateParkingSpotRequest;
import org.example.licenta.application.dto.response.ParkingSpotResponse;
import org.example.licenta.application.service.ParkingSpotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RestControllerAdvice
@RequestMapping("/api/parking-spot")
@RequiredArgsConstructor
public class ParkingSpotController {
    private final ParkingSpotService parkingSpotService;

    @GetMapping
    public ResponseEntity<List<ParkingSpotResponse>> getAllSpots(){
        return ResponseEntity.status(HttpStatus.OK).body(parkingSpotService.getAllSpots());
    }

    @GetMapping("/{spotId}")
    public ResponseEntity<ParkingSpotResponse> getSpotById(@PathVariable String spotId){
        return ResponseEntity.status(HttpStatus.OK).body(parkingSpotService.getSpotById(UUID.fromString(spotId)));
    }

    @GetMapping("/manage")
    public ResponseEntity<List<ParkingSpotResponse>> getAllSpots(Authentication authentication){
        UUID ownerId = UUID.fromString(authentication.getName());

        return ResponseEntity.status(HttpStatus.OK).body(parkingSpotService.getAllSpots(ownerId));
    }

    @PostMapping
    public ResponseEntity<ParkingSpotResponse> createParkingSpot(@RequestBody CreateParkingSpotRequest createParkingSpotRequest, Authentication authentication) {
        UUID ownerId = UUID.fromString(authentication.getName());
        ParkingSpotResponse response = parkingSpotService.createParkingSpot(createParkingSpotRequest, ownerId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}