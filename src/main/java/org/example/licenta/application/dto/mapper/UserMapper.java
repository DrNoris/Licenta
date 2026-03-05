package org.example.licenta.application.dto.mapper;

import org.example.licenta.application.dto.request.RegisterRequest;
import org.example.licenta.domain.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = PasswordEncoderMapper.class)
public interface UserMapper {
    @Mapping(target = "password", source = "password", qualifiedByName = "encodePassword")
    User toEntity(RegisterRequest registerRequest);
}
