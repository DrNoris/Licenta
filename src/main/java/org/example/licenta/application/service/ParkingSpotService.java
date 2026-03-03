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
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParkingSpotService {
    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;

    private final ParkingSpotMapper parkingSpotMapper;

    public List<ParkingSpotResponse> getAllSpots() {
        return parkingSpotRepository.findAll().stream().map(parkingSpotMapper::toResponse).toList();
    }

    public List<ParkingSpotResponse> getAllSpots(UUID ownerId) {
        return parkingSpotRepository.findByOwnerId(ownerId).stream().map(parkingSpotMapper::toResponse).toList();
    }


    public ParkingSpotResponse getSpotById(UUID spotId) {
        ParkingSpot parkingSpot = parkingSpotRepository.findById(spotId).orElseThrow(() -> new NoSuchElementException("Parking spot does not exist"));

        return parkingSpotMapper.toResponse(parkingSpot);
    }

    @Transactional
    public ParkingSpotResponse createParkingSpot(CreateParkingSpotRequest request, UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        ParkingSpot newParkingSpot = parkingSpotMapper.toEntity(request, owner);

        newParkingSpot.getImages().forEach(image -> image.setParkingSpot(newParkingSpot));

        ParkingSpot saved = parkingSpotRepository.save(newParkingSpot);
        return parkingSpotMapper.toResponse(saved);
    }
}