package org.example.licenta.application.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.mapper.ParkingSpotMapper;
import org.example.licenta.application.dto.request.CreateParkingSpotRequest;
import org.example.licenta.application.dto.response.ParkingSpotResponse;
import org.example.licenta.domain.model.*;
import org.example.licenta.infrastructure.repository.ParkingSpotRepository;
import org.example.licenta.infrastructure.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParkingSpotService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;
    private final ParkingSpotMapper parkingSpotMapper;
    private final CloudinaryService cloudinaryService;

    public List<ParkingSpotResponse> getAllSpots() {
        return parkingSpotRepository.findAll().stream()
                .map(parkingSpotMapper::toResponse).toList();
    }

    public List<ParkingSpotResponse> getAllSpots(UUID ownerId) {
        return parkingSpotRepository.findByOwnerId(ownerId).stream()
                .map(parkingSpotMapper::toResponse).toList();
    }

    public ParkingSpotResponse getSpotById(UUID spotId) {
        return parkingSpotMapper.toResponse(
                parkingSpotRepository.findById(spotId)
                        .orElseThrow(() -> new NoSuchElementException("Parking spot does not exist"))
        );
    }

    @Transactional
    public ParkingSpotResponse createParkingSpot(CreateParkingSpotRequest request, List<MultipartFile> images, UUID ownerId) throws IOException {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        ParkingSpot spot = parkingSpotMapper.toEntity(request, owner);
        spot = parkingSpotRepository.save(spot); // save first to get the ID

        if (images != null) {
            for (MultipartFile file : images) {
                String publicId = cloudinaryService.uploadPrivate(
                        file, "parking-spots/" + spot.getId()
                );
                ParkingSpotImage image = ParkingSpotImage.builder()
                        .publicId(publicId)
                        .parkingSpot(spot)
                        .build();
                spot.getImages().add(image);
            }
            parkingSpotRepository.save(spot);
        }

        return parkingSpotMapper.toResponse(spot);
    }

    // Called by /images endpoint — returns signed URLs only for authorized users
    public List<String> getSignedImageUrls(UUID spotId) {
        ParkingSpot spot = parkingSpotRepository.findById(spotId)
                .orElseThrow(() -> new NoSuchElementException("Parking spot does not exist"));

        return spot.getImages().stream()
                .map(img -> cloudinaryService.generateSignedUrl(img.getPublicId()))
                .toList();
    }

    public boolean isOwner(UUID spotId, UUID userId) {
        return parkingSpotRepository.findById(spotId)
                .map(spot -> spot.getOwner().getId().equals(userId))
                .orElse(false);
    }
}