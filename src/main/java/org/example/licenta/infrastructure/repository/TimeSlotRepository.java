package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {
    @Query("SELECT t FROM TimeSlot t WHERE t.startHour <= :hour AND t.endHour > :hour")
    Optional<TimeSlot> findByHour(@Param("hour") int hour);
}