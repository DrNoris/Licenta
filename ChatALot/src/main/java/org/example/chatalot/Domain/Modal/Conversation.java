package org.example.chatalot.Domain.Modal;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(
        name = "conversations",
        schema = "chat",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"parking_spot_id", "buyer_id"}
        )
)
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "parking_spot_id", nullable = false)
    private UUID parkingSpotId;

    @Column(name = "parking_spot_address", nullable = false)
    private String parkingSpotAddress;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "buyer_name", nullable = false)
    private String buyerName;

    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @Column(name = "seller_name", nullable = false)
    private String sellerName;

    @Column(name = "last_message")
    private String lastMessage;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();
}