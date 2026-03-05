package org.example.licenta.application.dto.mapper;

import org.example.licenta.application.dto.response.TimeSlotResponse;
import org.example.licenta.domain.model.TimeSlot;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TimeSlotMapper {
    TimeSlotResponse toResponse (TimeSlot timeSlot);
}