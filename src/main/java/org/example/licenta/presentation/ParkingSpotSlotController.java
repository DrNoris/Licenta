package org.example.licenta.presentation;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.request.AddAvailabilityRequest;
import org.example.licenta.application.dto.response.AvailabilityResponse;
import org.example.licenta.application.dto.response.ParkingSpotSlotResponse;
import org.example.licenta.application.service.ParkingSpotSlotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RestControllerAdvice
@RequestMapping("/api/parking-spot-slots")
@RequiredArgsConstructor
public class ParkingSpotSlotController {
    private final ParkingSpotSlotService parkingSpotSlotService;

    @GetMapping("/{spotId}/manage")
    public ResponseEntity<List<ParkingSpotSlotResponse>> getAllSlots(@PathVariable String spotId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date, Authentication authentication) throws AccessDeniedException {
        UUID ownerId = UUID.fromString(authentication.getName());
        List<ParkingSpotSlotResponse> response = parkingSpotSlotService.getAllSlotsForDate(ownerId, UUID.fromString(spotId), date);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{spotId}/availability")
    public ResponseEntity<AvailabilityResponse> getAvailability(@PathVariable String spotId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        AvailabilityResponse availabilityResponse = parkingSpotSlotService.getAvailability(UUID.fromString(spotId), date);
        return ResponseEntity.status(HttpStatus.OK).body(availabilityResponse);
    }

    @PostMapping("/{parkingSpotId}")
    public ResponseEntity<Void> createParkingSpotAvailability(@PathVariable UUID parkingSpotId, @RequestBody AddAvailabilityRequest addAvailabilityRequest, Authentication authentication) throws AccessDeniedException {
        UUID ownerId = UUID.fromString(authentication.getName());
        parkingSpotSlotService.createParkingSpotAvailability(parkingSpotId, addAvailabilityRequest, ownerId);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
