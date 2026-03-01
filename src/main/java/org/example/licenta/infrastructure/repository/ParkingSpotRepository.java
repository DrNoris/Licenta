package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    List<ParkingSpot> findByOwnerId(UUID ownerId);
}