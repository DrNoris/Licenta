package org.example.licenta.application.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.example.licenta.application.dto.mapper.AvailabilityMapper;
import org.example.licenta.application.dto.mapper.ParkingSpotSlotMapper;
import org.example.licenta.application.dto.request.AddAvailabilityRequest;
import org.example.licenta.application.dto.response.AvailabilityResponse;
import org.example.licenta.application.dto.response.ParkingSpotSlotResponse;
import org.example.licenta.domain.model.ParkingSpot;
import org.example.licenta.domain.model.ParkingSpotSlot;
import org.example.licenta.domain.model.TimeSlot;
import org.example.licenta.infrastructure.repository.ParkingSpotRepository;
import org.example.licenta.infrastructure.repository.ParkingSpotSlotRepository;
import org.example.licenta.infrastructure.repository.TimeSlotRepository;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ParkingSpotSlotService {
    private final ParkingSpotSlotRepository parkingSpotSlotRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final TimeSlotRepository timeSlotRepository;

    private final ParkingSpotSlotMapper parkingSpotSlotMapper;
    private final AvailabilityMapper availabilityMapper;

    public AvailabilityResponse getAvailability(UUID spotId, LocalDate date) {
        List<ParkingSpotSlot> freeSlots = parkingSpotSlotRepository.findByParkingSpotIdAndDateAndBookingIsNull(spotId, date);

        return availabilityMapper.toAvailabilityResponse(freeSlots, date);
    }

    public List<ParkingSpotSlotResponse> getAllSlotsForDate(UUID ownerId, UUID spotId, LocalDate date) throws AccessDeniedException {
        ParkingSpot parkingSpot = parkingSpotRepository.findById(spotId).orElseThrow(() -> new NoSuchElementException("Parking spot does not exist"));

        if (!parkingSpot.getOwner().getId().equals(ownerId))
            throw new AccessDeniedException("You do not have access to this parking spot");

        List<ParkingSpotSlot> allSlots = parkingSpotSlotRepository.findByParkingSpotIdAndDate(spotId, date);

        return parkingSpotSlotMapper.toResponseList(allSlots);
    }

    @Transactional
    public void createParkingSpotAvailability(UUID parkingSpotId, AddAvailabilityRequest addAvailabilityRequest, UUID ownerId) throws AccessDeniedException {
        ParkingSpot spot = parkingSpotRepository.findById(parkingSpotId)
                .orElseThrow(() -> new NoSuchElementException("Parking spot not found"));

        if (!spot.getOwner().getId().equals(ownerId)) {
            throw new AccessDeniedException("You do not own this parking spot");
        }

        for (UUID timeSlotId : addAvailabilityRequest.getTimeSlotIds()) {
            boolean alreadyExists = parkingSpotSlotRepository
                    .existsByParkingSpotIdAndTimeSlotIdAndDate(
                            parkingSpotId, timeSlotId, addAvailabilityRequest.getDate());

            if (alreadyExists) continue;

            TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                    .orElseThrow(() -> new NoSuchElementException("TimeSlot not found: " + timeSlotId));

            ParkingSpotSlot slot = ParkingSpotSlot.builder()
                    .parkingSpot(spot)
                    .timeSlot(timeSlot)
                    .date(addAvailabilityRequest.getDate())
                    .booking(null)
                    .build();

            parkingSpotSlotRepository.save(slot);
        }
    }
}
