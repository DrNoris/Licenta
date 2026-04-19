package org.example.licenta.infrastructure.repository;

import org.example.licenta.domain.model.User;
import org.example.licenta.domain.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Optional<Wallet> findByUser(User user);
}
