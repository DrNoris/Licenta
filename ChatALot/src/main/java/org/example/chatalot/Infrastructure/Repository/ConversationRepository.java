package org.example.chatalot.Infrastructure.Repository;

import org.example.chatalot.Domain.Modal.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    List<Conversation> findByBuyerIdOrSellerIdOrderByLastMessageAtDesc(
            UUID buyerId, UUID sellerId
    );

    Optional<Conversation> findByParkingSpotIdAndBuyerIdOrParkingSpotIdAndSellerId(
            UUID spotId1, UUID buyerId,
            UUID spotId2, UUID sellerId
    );

    @Query("""
    SELECT c FROM Conversation c
    WHERE c.parkingSpotId = :spotId
    AND (c.buyerId = :userId OR c.sellerId = :userId)
""")
    Optional<Conversation> findBySpotAndUser(
            @Param("spotId") UUID spotId,
            @Param("userId") UUID userId
    );
}