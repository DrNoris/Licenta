package org.example.chatalot.Domain.Modal;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "messages", schema = "chat")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(name = "sender_name", nullable = false)
    private String senderName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;
}