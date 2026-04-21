package org.example.licenta.presentation;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.request.CreateParkingSpotRequest;
import org.example.licenta.application.dto.request.UpdateParkingSpotRequest;
import org.example.licenta.application.dto.response.ParkingSpotOwnerResponse;
import org.example.licenta.application.dto.response.ParkingSpotResponse;
import org.example.licenta.application.service.ParkingSpotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/parking-spot")
@RequiredArgsConstructor
public class ParkingSpotController {

    private final ParkingSpotService parkingSpotService;

    @GetMapping
    public ResponseEntity<List<ParkingSpotResponse>> getAllSpots() {
        return ResponseEntity.ok(parkingSpotService.getAllSpots());
    }

    @GetMapping("/{spotId}")
    public ResponseEntity<ParkingSpotResponse> getSpotById(@PathVariable String spotId) {
        return ResponseEntity.ok(parkingSpotService.getSpotById(UUID.fromString(spotId)));
    }

    @GetMapping("/{spotId}/owner")
    public ResponseEntity<ParkingSpotOwnerResponse> getOwner(@PathVariable UUID spotId) {
        ParkingSpotOwnerResponse response = parkingSpotService.getSpotOwner(spotId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/manage")
    public ResponseEntity<List<ParkingSpotResponse>> getMySpots(Authentication authentication) {
        UUID ownerId = UUID.fromString(authentication.getName());
        List<ParkingSpotResponse> repsonse = parkingSpotService.getAllSpots(ownerId);

        return ResponseEntity.ok(repsonse);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ParkingSpotResponse> createParkingSpot(@RequestPart("data") CreateParkingSpotRequest request, @RequestPart(value = "images", required = false) List<MultipartFile> images, Authentication authentication) throws IOException {
        UUID ownerId = UUID.fromString(authentication.getName());
        ParkingSpotResponse response = parkingSpotService.createParkingSpot(request, images, ownerId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping(value ="/{spotId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ParkingSpotResponse> updateParkingSpot(@PathVariable UUID spotId, @RequestPart("data") UpdateParkingSpotRequest request, @RequestPart(value = "images", required = false) List<MultipartFile> images, Authentication authentication) throws IOException {
        UUID ownerId = UUID.fromString(authentication.getName());
        ParkingSpotResponse response = parkingSpotService.updateParkingSpot(request, images, ownerId, spotId);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @DeleteMapping("/{parkingSpotId}")
    public ResponseEntity<Void> deleteParkingSpot(@PathVariable UUID parkingSpotId, Authentication authentication) {
        UUID ownerId = UUID.fromString(authentication.getName());

        try {
            parkingSpotService.deleteParkingSpot(parkingSpotId, ownerId);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping("/{spotId}/images")
    public ResponseEntity<List<String>> getImages(@PathVariable String spotId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        UUID spotUUID = UUID.fromString(spotId);

        try {
            List<String> response = parkingSpotService.getSignedImageUrls(requesterId, spotUUID);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<ParkingSpotResponse>> search(
            @RequestParam Double swLat,
            @RequestParam Double swLng,
            @RequestParam Double neLat,
            @RequestParam Double neLng,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) List<String> timeSlotIds,
            @RequestParam(required = false) Double minPricePerHour,
            @RequestParam(required = false) Double maxPricePerHour,
            Authentication authentication
    ) {
        UUID currentUserId = authentication != null ? UUID.fromString(authentication.getName()) : null;

        return ResponseEntity.ok(
                parkingSpotService.search(swLat, swLng, neLat, neLng,
                        date, timeSlotIds, minPricePerHour, maxPricePerHour, currentUserId)
        );
    }
}