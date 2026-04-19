package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, UUID> {
    List<ParkingSpot> findByOwnerId(UUID ownerId);

    @Query("""
        SELECT p FROM ParkingSpotSlot s
        JOIN s.parkingSpot p
        WHERE p.latitude  BETWEEN :swLat AND :neLat
        AND   p.longitude BETWEEN :swLng AND :neLng
        AND   (:minPrice IS NULL OR p.pricePerHour >= :minPrice)
        AND   (:maxPrice IS NULL OR p.pricePerHour <= :maxPrice)
        AND   s.date = :date
        AND   s.booking IS NULL
        AND   (:timeSlotIds IS NULL OR s.timeSlot.id IN :timeSlotIds)
    """)
    List<ParkingSpot> search(
            @Param("swLat")       Double swLat,
            @Param("swLng")       Double swLng,
            @Param("neLat")       Double neLat,
            @Param("neLng")       Double neLng,
            @Param("date") LocalDate date,
            @Param("timeSlotIds") List<UUID> timeSlotIds,
            @Param("minPrice")    Double minPrice,
            @Param("maxPrice")    Double maxPrice
    );
}