package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.ParkingSpotSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ParkingSpotSlotRepository extends JpaRepository<ParkingSpotSlot, UUID> {

    boolean existsByParkingSpotIdAndTimeSlotIdAndDate(UUID spotId, UUID timeSlotId, LocalDate date);

    List<ParkingSpotSlot> findByParkingSpotIdAndDateAndBookingIsNull(UUID spotId, LocalDate date);

    List<ParkingSpotSlot> findByParkingSpotIdAndDate(UUID spotId, LocalDate date);

    List<ParkingSpotSlot> findByParkingSpotId(UUID spotId);

    void deleteByParkingSpotIdAndDateAndBookingIsNull(UUID spotId, LocalDate date);
}