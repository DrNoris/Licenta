package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.ParkingSpotSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ParkingSpotSlotRepository extends JpaRepository<ParkingSpotSlot, Long> {

    List<ParkingSpotSlot> findByParkingSpotIdAndDateAndBookingIsNull(UUID parkingSpot_id, LocalDate date);

    List<ParkingSpotSlot> findByParkingSpotIdAndDate(UUID parkingSpot_id, LocalDate date);

    boolean existsByParkingSpotIdAndTimeSlotIdAndDateAndBookingIsNotNull(UUID parkingSpot_id, UUID timeSlot_id, LocalDate date);
}