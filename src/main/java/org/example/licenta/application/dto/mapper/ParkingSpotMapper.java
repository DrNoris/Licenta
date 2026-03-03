package org.example.licenta.application.dto.mapper;

import org.example.licenta.application.dto.request.CreateParkingSpotRequest;
import org.example.licenta.application.dto.response.ParkingSpotResponse;
import org.example.licenta.domain.model.ParkingSpot;
import org.example.licenta.domain.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", imports = {
        org.example.licenta.domain.model.ParkingSpotImage.class,
        java.util.stream.Collectors.class
})
public interface ParkingSpotMapper {
    @Mapping(target = "imageUrls",
            expression = "java(" +
                    "parkingSpot.getImages().stream().map(" +
                    "org.example.licenta.domain.model.ParkingSpotImage::getUrl)" +
                    ".toList())")
    ParkingSpotResponse toResponse(ParkingSpot parkingSpot);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "availableSlots", ignore = true)
    @Mapping(target = "owner", source = "owner")
    @Mapping(target = "images",
            expression = "java(" +
                    "request.getImageUrls() == null ? new java.util.ArrayList<>() : " +
                    "request.getImageUrls().stream()" +
                    ".map(url -> ParkingSpotImage.builder().url(url).build())" +
                    ".collect(java.util.stream.Collectors.toList())" +
                    ")")
    ParkingSpot toEntity(CreateParkingSpotRequest request, User owner);
}