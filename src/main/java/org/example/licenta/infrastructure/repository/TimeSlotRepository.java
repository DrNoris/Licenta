package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {
    boolean existsByStartHour(Integer startHour);
}