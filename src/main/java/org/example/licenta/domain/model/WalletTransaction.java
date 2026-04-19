package org.example.licenta.domain.model;

import com.stripe.param.checkout.SessionCreateParams;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.licenta.domain.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wallet_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}