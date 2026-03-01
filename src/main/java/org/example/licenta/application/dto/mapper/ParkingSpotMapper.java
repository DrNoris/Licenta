package org.example.licenta.application.dto.mapper;

import org.example.licenta.application.dto.response.ParkingSpotResponse;
import org.example.licenta.domain.model.ParkingSpot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ParkingSpotMapper {
    @Mapping(target = "imageUrls", expression = "java(parkingSpot.getImages().stream().map(org.example.licenta.domain.model.ParkingSpotImage::getUrl).toList())")
    ParkingSpotResponse toResponse(ParkingSpot parkingSpot);
}
