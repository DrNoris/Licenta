package org.example.licenta.application.dto.mapper;

import org.example.licenta.application.dto.response.ParkingSpotSlotResponse;
import org.example.licenta.domain.model.ParkingSpotSlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;


@Mapper(componentModel = "spring")
public interface ParkingSpotSlotMapper {

    @Mapping(target = "id", source = "parkingSpot.id")
    @Mapping(target = "startHour", source = "timeSlot.startHour")
    @Mapping(target = "endHour", source = "timeSlot.endHour")
    @Mapping(target = "bookingId", source = "booking.id")
    ParkingSpotSlotResponse toReponse(ParkingSpotSlot slot);

    List<ParkingSpotSlotResponse> toResponseList(List<ParkingSpotSlot> slots);
}