package org.example.licenta.application.dto.mapper;

import org.example.licenta.application.dto.response.BookingResponse;
import org.example.licenta.domain.model.Booking;
import org.example.licenta.domain.model.ParkingSpotSlot;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class BookingMapper {

    @Autowired
    protected ParkingSpotMapper parkingSpotMapper;

    @Autowired
    protected TimeSlotMapper timeSlotMapper;

    @Mapping(target = "parkingSpot", ignore = true)
    @Mapping(target = "date", ignore = true)
    @Mapping(target = "slots", ignore = true)
    @Mapping(target = "id", expression = "java(booking.getId().toString())")
    @Mapping(target = "status", expression = "java(booking.getStatus().name())")
    public abstract BookingResponse toResponse(Booking booking);

    @AfterMapping
    protected void afterMapping(Booking booking, @MappingTarget BookingResponse response) {
        if (booking.getReservedSlots() == null || booking.getReservedSlots().isEmpty()) return;

        ParkingSpotSlot firstSlot = booking.getReservedSlots().get(0);

        response.setDate(firstSlot.getDate().toString());
        response.setParkingSpot(parkingSpotMapper.toResponse(firstSlot.getParkingSpot()));
        response.setSlots(
                booking.getReservedSlots().stream()
                        .map(s -> timeSlotMapper.toResponse(s.getTimeSlot()))
                        .toList()
        );
    }
}