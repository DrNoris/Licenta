package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    boolean existsByStartHour(Integer startHour);
}