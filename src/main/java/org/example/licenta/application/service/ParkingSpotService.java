package org.example.licenta.application.service;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.mapper.ParkingSpotMapper;
import org.example.licenta.application.dto.mapper.TimeSlotMapper;
import org.example.licenta.application.dto.request.AddAvailabilityRequest;
import org.example.licenta.application.dto.request.CreateParkingSpotRequest;
import org.example.licenta.application.dto.response.AvailabilityResponse;
import org.example.licenta.application.dto.response.ParkingSpotResponse;
import org.example.licenta.application.dto.response.TimeSlotResponse;
import org.example.licenta.domain.model.ParkingSpotSlot;
import org.example.licenta.infrastructure.repository.ParkingSpotRepository;
import org.example.licenta.infrastructure.repository.ParkingSpotSlotRepository;
import org.example.licenta.infrastructure.repository.TimeSlotRepository;
import org.example.licenta.infrastructure.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParkingSpotService {
    private final ParkingSpotRepository parkingSpotRepository;
    private final ParkingSpotSlotRepository parkingSpotSlotRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;

    private final ParkingSpotMapper parkingSpotMapper;
    private final TimeSlotMapper timeSlotMapper;

    public List<ParkingSpotResponse> getAllSpots() {
        return parkingSpotRepository.findAll().stream().map(parkingSpotMapper::toResponse).toList();
    }

    public List<ParkingSpotResponse> getAllSpots(UUID ownerId) {
        return parkingSpotRepository.findByOwnerId(ownerId).stream().map(parkingSpotMapper::toResponse).toList();
    }

    public AvailabilityResponse getAvailability(UUID spotId, LocalDate date) {
        List<ParkingSpotSlot> freeParkingSpotSlotsForSelectedDate = parkingSpotSlotRepository.findByParkingSpotIdAndDateAndBookingIsNull(spotId, date);
        List<TimeSlotResponse> timeSlotResponseList = freeParkingSpotSlotsForSelectedDate.stream().map(parkingSpotSlot -> timeSlotMapper.toResponse(parkingSpotSlot.getTimeSlot())).toList();

        AvailabilityResponse availabilityResponse = new AvailabilityResponse();
        availabilityResponse.setDate(date);
        availabilityResponse.setAvailableSlots(timeSlotResponseList);

        return availabilityResponse;
    }

    public ParkingSpotResponse createParkingSpot(CreateParkingSpotRequest createParkingSpotRequest, UUID ownerId) {
        return null;
    }

    public void createParkingSpotAvailability(Long parkingSpotId, AddAvailabilityRequest addAvailabilityRequest, UUID ownerId) {
    }
}