package org.example.licenta.application.dto.mapper;

import org.example.licenta.application.dto.request.RegisterRequest;
import org.example.licenta.domain.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toEntity (RegisterRequest registerRequest);
}
