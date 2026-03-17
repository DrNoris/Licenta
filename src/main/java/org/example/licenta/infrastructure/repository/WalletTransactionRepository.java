package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {
}
