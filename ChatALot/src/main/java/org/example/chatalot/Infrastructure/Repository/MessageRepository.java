package org.example.chatalot.Infrastructure.Repository;

import org.example.chatalot.Domain.Modal.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByConversationIdOrderBySentAtDesc(UUID conversationId, Pageable pageable);

    @Query("""
        SELECT COUNT(m) FROM Message m
        WHERE m.conversation.id = :conversationId
        AND m.senderId != :userId
        AND m.readAt IS NULL
    """)
    long countUnreadMessages(
            @Param("conversationId") UUID conversationId,
            @Param("userId") UUID userId
    );

    @Modifying
    @Query("""
        UPDATE Message m SET m.readAt = :now
        WHERE m.conversation.id = :conversationId
        AND m.senderId != :userId
        AND m.readAt IS NULL
    """)
    void markAllAsRead(
            @Param("conversationId") UUID conversationId,
            @Param("userId") UUID userId,
            @Param("now") LocalDateTime now
    );
}