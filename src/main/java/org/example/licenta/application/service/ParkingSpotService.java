package org.example.licenta.application.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.mapper.ParkingSpotMapper;
import org.example.licenta.application.dto.request.CreateParkingSpotRequest;
import org.example.licenta.application.dto.request.UpdateParkingSpotRequest;
import org.example.licenta.application.dto.response.ParkingSpotOwnerResponse;
import org.example.licenta.application.dto.response.ParkingSpotResponse;
import org.example.licenta.domain.model.*;
import org.example.licenta.infrastructure.repository.ParkingSpotRepository;
import org.example.licenta.infrastructure.repository.ParkingSpotSlotRepository;
import org.example.licenta.infrastructure.repository.TimeSlotRepository;
import org.example.licenta.infrastructure.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ParkingSpotService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final ParkingSpotSlotRepository parkingSpotSlotRepository;
    private final UserRepository userRepository;
    private final TimeSlotRepository timeSlotRepository;

    private final ParkingSpotMapper parkingSpotMapper;
    private final CloudinaryService cloudinaryService;

    private final BookingService bookingService;

    public List<ParkingSpotResponse> getAllSpots() {
        return parkingSpotRepository.findAll().stream()
                .map(this::toResponseWithImages)
                .toList();
    }

    public List<ParkingSpotResponse> getAllSpots(UUID ownerId) {
        return parkingSpotRepository.findByOwnerId(ownerId).stream()
                .map(this::toResponseWithImages)
                .toList();
    }

    public ParkingSpotResponse getSpotById(UUID spotId) {
        ParkingSpot spot = parkingSpotRepository.findById(spotId)
                .orElseThrow(() -> new NoSuchElementException("Parking spot does not exist"));
        return toResponseWithImages(spot);
    }

    public ParkingSpotOwnerResponse getSpotOwner(UUID id){
        ParkingSpot spot = parkingSpotRepository.findById(id).orElseThrow();
        ParkingSpotOwnerResponse response = new ParkingSpotOwnerResponse();
        response.setOwnerId(spot.getOwner().getId());
        response.setOwnerName(spot.getOwner().getUsername());
        response.setSpotAddress(spot.getAddress());

        return response;
    }

    @Transactional
    public ParkingSpotResponse createParkingSpot(CreateParkingSpotRequest request, List<MultipartFile> images, UUID ownerId) throws IOException {
        User owner = userRepository.findById(ownerId).orElseThrow(() -> new NoSuchElementException("User not found"));

        ParkingSpot spot = parkingSpotMapper.toEntity(request, owner);
        spot = parkingSpotRepository.save(spot);

        if (images != null) {
            for (MultipartFile file : images) {
                String publicId = cloudinaryService.uploadPrivate(file, "parking-spots/" + spot.getId());

                ParkingSpotImage image = ParkingSpotImage.builder()
                        .publicId(publicId)
                        .parkingSpot(spot)
                        .build();

                spot.getImages().add(image);
            }
            spot = parkingSpotRepository.save(spot);
        }

        return toResponseWithImages(spot);
    }

    @Transactional
    public ParkingSpotResponse updateParkingSpot(UpdateParkingSpotRequest request, List<MultipartFile> images, UUID ownerId, UUID spotId) throws IOException {
        ParkingSpot parkingSpot = parkingSpotRepository.findById(spotId).orElseThrow(() -> new NoSuchElementException("Parking spot not found"));

        if (!parkingSpot.getOwner().getId().equals(ownerId))
            throw new AccessDeniedException("You do not have permission to edit this parking spot");

        parkingSpot.setDescription(request.getDescription());
        parkingSpot.setPricePerHour(request.getPricePerHour());

        if (request.getPublicIdsToDelete() != null) {
            for (String publicId : request.getPublicIdsToDelete()) {
                try {
                    cloudinaryService.deleteImage(publicId);
                } catch (IOException e) {
                    log.warn("Failed to delete image {} from Cloudinary: {}", publicId, e.getMessage());
                }
            }

            parkingSpot.getImages().removeIf(img -> request.getPublicIdsToDelete().contains(img.getPublicId()));
        }

        if (images != null) {
            for (MultipartFile file : images) {
                String publicId = cloudinaryService.uploadPrivate(file, "parking-spots/" + parkingSpot.getId());
                ParkingSpotImage image = ParkingSpotImage.builder()
                        .publicId(publicId)
                        .parkingSpot(parkingSpot)
                        .build();
                parkingSpot.getImages().add(image);
            }
        }

        return toResponseWithImages(parkingSpotRepository.save(parkingSpot));
    }

    @Transactional
    public void deleteParkingSpot(UUID spotId, UUID ownerId) throws IOException {
        ParkingSpot spot = parkingSpotRepository.findById(spotId)
                .orElseThrow(() -> new NoSuchElementException("Parking spot not found"));

        if (!spot.getOwner().getId().equals(ownerId))
            throw new AccessDeniedException("You do not have permission to delete this parking spot");

        boolean hasUpcoming = parkingSpotSlotRepository.hasUpcomingBookings(spotId, LocalDate.now());

        if (hasUpcoming)
            throw new IllegalStateException("Cannot delete a parking spot with upcoming bookings");

        for (ParkingSpotImage image : spot.getImages()) {
            try {
                cloudinaryService.deleteImage(image.getPublicId());
            } catch (IOException e) {
                log.warn("Failed to delete image {} from Cloudinary: {}", image.getPublicId(), e.getMessage());
            }
        }

        parkingSpotRepository.delete(spot);
    }

    public List<String> getSignedImageUrls(UUID requesterId, UUID spotId) throws AccessDeniedException {
        boolean isOwner = isOwner(spotId, requesterId);
        boolean hasPaid = bookingService.hasActiveBooking(spotId, requesterId);

        if (!isOwner  && !hasPaid) {
            throw new AccessDeniedException("You do not have permission to see these imagines");
        }

        ParkingSpot spot = parkingSpotRepository.findById(spotId)
                .orElseThrow(() -> new NoSuchElementException("Parking spot does not exist"));
        return spot.getImages().stream()
                .map(img -> cloudinaryService.generateSignedUrl(img.getPublicId()))
                .toList();
    }

    public List<ParkingSpotResponse> search(
            Double swLat, Double swLng, Double neLat, Double neLng,
            String date, List<String> timeSlotIds,
            Double minPrice, Double maxPrice,
            UUID currentUserId
    ) {
        LocalDate parsedDate = date != null ? LocalDate.parse(date) : null;

        List<UUID> parsedSlotIds = (timeSlotIds != null && !timeSlotIds.isEmpty())
                ? timeSlotIds.stream().map(UUID::fromString).toList()
                : null;

        LocalTime now = LocalTime.now();
        int currentHour = now.getMinute() >= 45 ? now.getHour() + 1 : now.getHour();
        UUID currentTimeSlotId = timeSlotRepository.findByHour(currentHour)
                .map(TimeSlot::getId)
                .orElse(null);

        return parkingSpotRepository
                .search(swLat, swLng, neLat, neLng, parsedDate, parsedSlotIds, minPrice, maxPrice)
                .stream()
                .map(spot -> {
                    ParkingSpotResponse response = parkingSpotMapper.toResponse(spot);

                    LocalDate todayInRomania = LocalDate.now(ZoneId.of("Europe/Bucharest"));
                    if (currentTimeSlotId != null && parsedSlotIds == null && parsedDate != null && parsedDate.equals(todayInRomania)) {
                        boolean availableNow = parkingSpotSlotRepository
                                .existsByParkingSpotIdAndTimeSlotIdAndDateAndBookingIsNull(
                                        spot.getId(), currentTimeSlotId, parsedDate
                                );
                        response.setAvailableNow(availableNow);
                    }

                    if (spot.getOwner().getId().equals(currentUserId)) {
                        List<String> signedUrls = spot.getImages().stream()
                                .map(img -> cloudinaryService.generateSignedUrl(img.getPublicId()))
                                .toList();

                        response.setImagePublicIds(signedUrls);
                    }

                    return response;
                })
                .toList();
    }

    private boolean isOwner(UUID spotId, UUID userId) {
        return parkingSpotRepository.findById(spotId)
                .map(spot -> spot.getOwner().getId().equals(userId))
                .orElse(false);
    }

    private ParkingSpotResponse toResponseWithImages(ParkingSpot spot) {
        ParkingSpotResponse response = parkingSpotMapper.toResponse(spot);
        List<String> publicIds = spot.getImages().stream()
                .map(ParkingSpotImage::getPublicId)
                .toList();
        response.setImagePublicIds(publicIds);
        return response;
    }
}