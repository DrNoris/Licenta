package org.example.licenta.presentation;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.request.CreateParkingSpotRequest;
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

    @GetMapping("/manage")
    public ResponseEntity<List<ParkingSpotResponse>> getMySpots(Authentication authentication) {
        UUID ownerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(parkingSpotService.getAllSpots(ownerId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ParkingSpotResponse> createParkingSpot(
            @RequestPart("data") CreateParkingSpotRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication
    ) throws IOException {
        UUID ownerId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(parkingSpotService.createParkingSpot(request, images, ownerId));
    }

    //mutat in service
    @GetMapping("/{spotId}/images")
    public ResponseEntity<List<String>> getImages(
            @PathVariable String spotId,
            Authentication authentication
    ) {
        UUID requesterId = UUID.fromString(authentication.getName());
        UUID spotUUID = UUID.fromString(spotId);

        boolean isOwner = parkingSpotService.isOwner(spotUUID, requesterId);
        // boolean hasPaid = bookingService.hasActiveBooking(spotUUID, requesterId); // add later

        if (!isOwner /* && !hasPaid */) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(parkingSpotService.getSignedImageUrls(spotUUID));
    }
}