package org.example.licenta.application.dto.mapper;

import org.example.licenta.application.dto.request.CreateParkingSpotRequest;
import org.example.licenta.application.dto.response.ParkingSpotResponse;
import org.example.licenta.domain.model.ParkingSpot;
import org.example.licenta.domain.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ParkingSpotMapper {
    @Mapping(target = "imagePublicIds", ignore = true)
    @Mapping(target = "address", source = "address")
    ParkingSpotResponse toResponse(ParkingSpot parkingSpot);

    @Mapping(target = "id",             ignore = true)
    @Mapping(target = "availableSlots", ignore = true)
    @Mapping(target = "owner",          source = "owner")
    @Mapping(target = "images",         expression = "java(new java.util.ArrayList<>())")
    @Mapping(target = "address",        source = "request.address")
    ParkingSpot toEntity(CreateParkingSpotRequest request, User owner);
}