package org.example.licenta.application.dto.mapper;

import org.example.licenta.application.dto.response.AvailabilityResponse;
import org.example.licenta.application.dto.response.TimeSlotResponse;
import org.example.licenta.domain.model.ParkingSpotSlot;
import org.example.licenta.domain.model.TimeSlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDate;
import java.util.List;

@Mapper(componentModel = "spring")
public interface AvailabilityMapper {

    @Mapping(target = "id", expression = "java(timeSlot.getId().toString())")
    TimeSlotResponse toTimeSlotResponse(TimeSlot timeSlot);

    default AvailabilityResponse toAvailabilityResponse(List<ParkingSpotSlot> slots, LocalDate date) {
        AvailabilityResponse response = new AvailabilityResponse();
        response.setDate(date);
        response.setAvailableSlots(slots.stream()
                .map(slot -> toTimeSlotResponse(slot.getTimeSlot()))
                .toList());
        return response;
    }
}