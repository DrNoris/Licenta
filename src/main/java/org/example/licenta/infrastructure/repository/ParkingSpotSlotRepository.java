package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.ParkingSpotSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParkingSpotSlotRepository extends JpaRepository<ParkingSpotSlot, UUID> {

    boolean existsByParkingSpotIdAndTimeSlotIdAndDate(UUID spotId, UUID timeSlotId, LocalDate date);

    List<ParkingSpotSlot> findByParkingSpotIdAndDateAndBookingIsNull(UUID spotId, LocalDate date);

    List<ParkingSpotSlot> findByParkingSpotIdAndDate(UUID spotId, LocalDate date);

    List<ParkingSpotSlot> findByParkingSpotId(UUID spotId);

    void deleteByParkingSpotIdAndDateAndBookingIsNull(UUID spotId, LocalDate date);

    Optional<ParkingSpotSlot> findByParkingSpotIdAndTimeSlotIdAndDate(UUID spotId, UUID timeSlotId, LocalDate date);

    @Query("""
    SELECT COUNT(s) > 0 FROM ParkingSpotSlot s
    WHERE s.parkingSpot.id = :spotId
    AND s.booking IS NOT NULL
    AND s.date >= :today
    """)
    boolean hasUpcomingBookings(@Param("spotId") UUID spotId, @Param("today") LocalDate today);

    @Query("""
    SELECT s FROM ParkingSpotSlot s
    WHERE s.parkingSpot.id = :spotId
    AND s.timeSlot.id IN :timeSlotIds
    AND s.date IN :dates
""")
    List<ParkingSpotSlot> findAllByParkingSpotIdAndTimeSlotIdInAndDateIn(
            @Param("spotId")      UUID spotId,
            @Param("timeSlotIds") List<UUID> timeSlotIds,
            @Param("dates")       List<LocalDate> dates
    );
}