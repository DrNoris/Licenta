package org.example.chatalot.Application.dto.mapper;

import org.example.chatalot.Application.dto.response.ConversationResponse;
import org.example.chatalot.Application.dto.response.MessageResponse;
import org.example.chatalot.Domain.Modal.Conversation;
import org.example.chatalot.Domain.Modal.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.AfterMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Context;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface ChatMapper {
    @Mapping(target = "otherUserId",   ignore = true)
    @Mapping(target = "otherUserName", ignore = true)
    @Mapping(target = "unreadCount",   ignore = true)
    ConversationResponse toResponse(Conversation conversation, @Context UUID currentUserId);

    @AfterMapping
    default void fillOtherUser(
            Conversation conversation,
            @MappingTarget ConversationResponse response,
            @Context UUID currentUserId
    ) {
        boolean isBuyer = conversation.getBuyerId().equals(currentUserId);
        response.setOtherUserId(isBuyer ? conversation.getSellerId() : conversation.getBuyerId());
        response.setOtherUserName(isBuyer ? conversation.getSellerName() : conversation.getBuyerName());
    }

    @Mapping(target = "conversationId", source = "conversation.id")
    MessageResponse toMessageResponse(Message message);
}