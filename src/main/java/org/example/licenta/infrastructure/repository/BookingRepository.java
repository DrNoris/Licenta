package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByClientId(UUID clientId);

    @Query("""
    SELECT b FROM Booking b
    JOIN b.reservedSlots s
    WHERE b.client.id = :userId
    AND s.date >= :today
    AND b.status = 'CONFIRMED'
    """)
    Page<Booking> findUpcomingByUserId(@Param("userId") UUID userId, @Param("today") LocalDate today, Pageable pageable);

    @Query("""
    SELECT DISTINCT b FROM Booking b
    JOIN b.reservedSlots s
    WHERE b.client.id = :userId
    AND s.date <= :today
    AND b.status = 'CONFIRMED'
    """)
    Page<Booking> findArchiveByUserId(@Param("userId") UUID userId, @Param("today") LocalDate today, Pageable pageable);

    @Query("""
    SELECT COUNT(b) > 0 FROM Booking b
    JOIN b.reservedSlots s
    WHERE b.client.id = :userId
    AND s.parkingSpot.id = :spotId
    AND b.status = 'CONFIRMED'
    AND s.date >= :today
""")
    boolean hasActiveBooking(@Param("spotId") UUID spotId, @Param("userId") UUID userId, @Param("today") LocalDate today);
}