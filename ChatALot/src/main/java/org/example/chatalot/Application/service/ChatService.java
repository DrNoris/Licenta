package org.example.chatalot.Application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.chatalot.Application.dto.mapper.ChatMapper;
import org.example.chatalot.Application.dto.request.CreateConversationRequest;
import org.example.chatalot.Application.dto.response.ConversationResponse;
import org.example.chatalot.Application.dto.response.MessageResponse;
import org.example.chatalot.Application.dto.response.ParkingSpotResponse;
import org.example.chatalot.Domain.Modal.Conversation;
import org.example.chatalot.Domain.Modal.Message;
import org.example.chatalot.Infrastructure.Repository.ConversationRepository;
import org.example.chatalot.Infrastructure.Repository.MessageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ChatMapper chatMapper;
    private final RestTemplate restTemplate;

    @Value("${main.app.url}")
    private String mainAppUrl;

    public List<ConversationResponse> getConversations(UUID userId) {
        return conversationRepository
                .findByBuyerIdOrSellerIdOrderByLastMessageAtDesc(userId, userId)
                .stream()
                .map(c -> {
                    ConversationResponse response = chatMapper.toResponse(c, userId);
                    response.setUnreadCount(messageRepository.countUnreadMessages(c.getId(), userId));
                    return response;
                })
                .toList();
    }

    @Transactional
    public ConversationResponse getOrCreateConversation(CreateConversationRequest request, UUID requesterId, String requesterName) {
        return conversationRepository
                .findBySpotAndUser(request.getParkingSpotId(), requesterId)
                .map(c -> chatMapper.toResponse(c, requesterId))
                .orElseGet(() -> {
                    ParkingSpotResponse spotData = fetchOwnerData(request.getParkingSpotId());

                    UUID buyerId;
                    String buyerName;
                    UUID sellerId;
                    String sellerName;

                    if (spotData.getOwnerId().equals(requesterId)) {
                        UUID actualBuyerId = fetchBuyerFromBooking(request.getParkingSpotId());
                        sellerId = requesterId;
                        sellerName = requesterName;
                        buyerId = actualBuyerId;
                        buyerName = fetchUserName(actualBuyerId);
                    } else {
                        validateBooking(request.getParkingSpotId(), requesterId);
                        buyerId = requesterId;
                        buyerName = requesterName;
                        sellerId = spotData.getOwnerId();
                        sellerName = spotData.getOwnerName();
                    }

                    Conversation conversation = Conversation.builder()
                            .parkingSpotId(request.getParkingSpotId())
                            .parkingSpotAddress(spotData.getSpotAddress())
                            .buyerId(buyerId)
                            .buyerName(buyerName)
                            .sellerId(sellerId)
                            .sellerName(sellerName)
                            .createdAt(LocalDateTime.now())
                            .build();

                    return chatMapper.toResponse(
                            conversationRepository.save(conversation), requesterId
                    );
                });
    }

    public Page<MessageResponse> getMessages(UUID conversationId, UUID userId, Pageable pageable) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new NoSuchElementException("Conversation not found"));

        if (!conversation.getBuyerId().equals(userId) &&
                !conversation.getSellerId().equals(userId)) {
            throw new SecurityException("Access denied");
        }

        return messageRepository
                .findByConversationIdOrderBySentAtDesc(conversationId, pageable)
                .map(chatMapper::toMessageResponse);
    }

    @Transactional
    public MessageResponse saveMessage(UUID conversationId, UUID senderId, String senderName, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new NoSuchElementException("Conversation not found"));

        Message message = Message.builder()
                .conversation(conversation)
                .senderId(senderId)
                .senderName(senderName)
                .content(content)
                .sentAt(LocalDateTime.now())
                .build();

        message = messageRepository.save(message);

        conversation.setLastMessage(content);
        conversation.setLastMessageAt(message.getSentAt());
        conversationRepository.save(conversation);

        return chatMapper.toMessageResponse(message);
    }

    @Transactional
    public void markAsRead(UUID conversationId, UUID userId) {
        messageRepository.markAllAsRead(conversationId, userId, LocalDateTime.now());
    }

    public long getUnreadCount(UUID userId) {
        return conversationRepository
                .findByBuyerIdOrSellerIdOrderByLastMessageAtDesc(userId, userId)
                .stream()
                .mapToLong(c -> messageRepository
                        .countUnreadMessages(c.getId(), userId))
                .sum();
    }

    private void validateBooking(UUID spotId, UUID buyerId) {
        try {
            Boolean valid = restTemplate.getForObject(
                    mainAppUrl + "/api/bookings/validate?spotId={s}&buyerId={b}",
                    Boolean.class,
                    spotId, buyerId
            );
            if (Boolean.FALSE.equals(valid)) {
                throw new SecurityException("No confirmed booking found for this spot");
            }
        } catch (SecurityException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Could not validate booking with main app: {}", e.getMessage());
        }
    }

    private ParkingSpotResponse fetchOwnerData(UUID spotId) {
        return restTemplate.getForObject(
                mainAppUrl + "/api/parking-spot/{spotId}/owner",
                ParkingSpotResponse.class,
                spotId
        );
    }

    private UUID fetchBuyerFromBooking(UUID spotId) {
        return restTemplate.getForObject(
                mainAppUrl + "/api/bookings/buyer?spotId={s}",
                UUID.class,
                spotId
        );
    }

    private String fetchUserName(UUID userId) {
        try {
            return restTemplate.getForObject(
                    mainAppUrl + "/api/users/{id}/name",
                    String.class,
                    userId
            );
        } catch (Exception e) {
            log.warn("Could not fetch user name for {}: {}", userId, e.getMessage());
            return "Utilizator";
        }
    }
}