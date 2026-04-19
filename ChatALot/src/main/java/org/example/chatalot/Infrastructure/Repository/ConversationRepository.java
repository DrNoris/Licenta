package org.example.chatalot.Infrastructure.Repository;

import org.example.chatalot.Domain.Modal.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    List<Conversation> findByBuyerIdOrSellerIdOrderByLastMessageAtDesc(
            UUID buyerId, UUID sellerId
    );

    Optional<Conversation> findByParkingSpotIdAndBuyerId(
            UUID parkingSpotId, UUID buyerId
    );
}