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
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

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

        if (!LocalDate.now().isEqual(date))
            return availabilityMapper.toAvailabilityResponse(freeSlots, date);

        LocalTime now = LocalTime.now();
        List<ParkingSpotSlot> filteredSlots = freeSlots.stream().filter(parkingSpotSlot -> parkingSpotSlot.getTimeSlot().getEndHour() > now.getHour()).toList();

        return availabilityMapper.toAvailabilityResponse(filteredSlots, date);
    }

    public List<ParkingSpotSlotResponse> getAllSlotsForDate(UUID ownerId, UUID spotId, LocalDate date) throws AccessDeniedException {
        ParkingSpot parkingSpot = parkingSpotRepository.findById(spotId).orElseThrow(() -> new NoSuchElementException("Parking spot does not exist"));

        if (!parkingSpot.getOwner().getId().equals(ownerId))
            throw new AccessDeniedException("You do not have access to this parking spot");

        List<ParkingSpotSlot> allSlots = parkingSpotSlotRepository.findByParkingSpotIdAndDate(spotId, date);

        return parkingSpotSlotMapper.toResponseList(allSlots);
    }

    @Transactional
    public void createParkingSpotAvailability(UUID parkingSpotId, AddAvailabilityRequest request, UUID ownerId) throws AccessDeniedException {
        ParkingSpot spot = parkingSpotRepository.findById(parkingSpotId)
                .orElseThrow(() -> new NoSuchElementException("Parking spot not found"));

        if (!spot.getOwner().getId().equals(ownerId))
            throw new AccessDeniedException("You do not own this parking spot");

        Set<String> existing = parkingSpotSlotRepository
                .findAllByParkingSpotIdAndTimeSlotIdInAndDateIn(
                        parkingSpotId, request.getTimeSlotIds(), request.getDates()
                )
                .stream()
                .map(s -> s.getDate() + "_" + s.getTimeSlot().getId())
                .collect(Collectors.toSet());

        List<TimeSlot> timeSlots = timeSlotRepository.findAllById(request.getTimeSlotIds());
        Map<UUID, TimeSlot> timeSlotMap = timeSlots.stream()
                .collect(Collectors.toMap(TimeSlot::getId, ts -> ts));

        List<ParkingSpotSlot> toSave = new ArrayList<>();

        for (LocalDate date : request.getDates()) {
            for (UUID timeSlotId : request.getTimeSlotIds()) {
                String key = date + "_" + timeSlotId;
                if (existing.contains(key)) continue;

                toSave.add(ParkingSpotSlot.builder()
                        .parkingSpot(spot)
                        .timeSlot(timeSlotMap.get(timeSlotId))
                        .date(date)
                        .booking(null)
                        .build());
            }
        }

        parkingSpotSlotRepository.saveAll(toSave);
    }

    @Transactional
    public void deleteParkingSpotAvailability(UUID parkingSpotId, AddAvailabilityRequest request, UUID ownerId) throws AccessDeniedException {
        ParkingSpot spot = parkingSpotRepository.findById(parkingSpotId)
                .orElseThrow(() -> new NoSuchElementException("Parking spot not found"));

        if (!spot.getOwner().getId().equals(ownerId))
            throw new AccessDeniedException("You do not own this parking spot");

        List<ParkingSpotSlot> slotsToDelete = parkingSpotSlotRepository
                .findAllByParkingSpotIdAndTimeSlotIdInAndDateIn(
                        parkingSpotId,
                        request.getTimeSlotIds(),
                        request.getDates()
                );

        List<ParkingSpotSlot> deletable = slotsToDelete.stream()
                .filter(s -> s.getBooking() == null)
                .toList();

        parkingSpotSlotRepository.deleteAll(deletable);
    }
}
