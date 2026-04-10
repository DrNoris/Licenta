package org.example.licenta.application.service;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.mapper.BookingMapper;
import org.example.licenta.application.dto.request.CreateCheckoutRequest;
import org.example.licenta.application.dto.response.BookingResponse;
import org.example.licenta.domain.enums.BookingStatus;
import org.example.licenta.domain.enums.TransactionType;
import org.example.licenta.domain.model.*;
import org.example.licenta.infrastructure.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final ParkingSpotSlotRepository parkingSpotSlotRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    private final BookingMapper bookingMapper;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    public String createCheckoutSession(CreateCheckoutRequest request, UUID userId) throws StripeException {
        ParkingSpot spot = parkingSpotRepository.findById(UUID.fromString(request.getParkingSpotId()))
                .orElseThrow(() -> new NoSuchElementException("Parking spot not found"));

        long slotCount = request.getTimeSlotIds().size();
        long unitAmount = Math.round(spot.getPricePerHour() * 100);
        long totalAmount = unitAmount * slotCount;

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(slotCount)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("ron")
                                                .setUnitAmount(unitAmount)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Loc parcare – " + spot.getDescription())
                                                                .setDescription(spot.getAddress() + " · " + request.getDate())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("parkingSpotId", request.getParkingSpotId())
                .putMetadata("userId", userId.toString())
                .putMetadata("date", request.getDate())
                .putMetadata("timeSlotIds", String.join(",", request.getTimeSlotIds()))
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    @Transactional
    public void fulfillBooking(Session session) {
        Map<String, String> metadata = session.getMetadata();

        UUID spotId = UUID.fromString(metadata.get("parkingSpotId"));
        UUID userId = UUID.fromString(metadata.get("userId"));
        String date = metadata.get("date");
        List<String> timeSlotIds = Arrays.asList(metadata.get("timeSlotIds").split(","));

        User client = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        ParkingSpot spot = parkingSpotRepository.findById(spotId).orElseThrow();
        User owner = spot.getOwner();
        Wallet ownerWallet = walletRepository.findByUser(owner)
                .orElseGet(() -> walletRepository.save(Wallet.builder()
                        .user(owner)
                        .balance(BigDecimal.ZERO)
                        .build()));

        double totalPrice = timeSlotIds.size() * parkingSpotRepository
                .findById(spotId)
                .orElseThrow()
                .getPricePerHour();

        ownerWallet.setBalance(ownerWallet.getBalance().add(BigDecimal.valueOf(totalPrice)));
        walletRepository.save(ownerWallet);

        Booking booking = Booking.builder()
                .client(client)
                .totalPrice(totalPrice)
                .status(BookingStatus.CONFIRMED)
                .build();
        bookingRepository.save(booking);

        walletTransactionRepository.save(WalletTransaction.builder()
                .wallet(ownerWallet)
                .amount(BigDecimal.valueOf(totalPrice))
                .type(TransactionType.CREDIT)
                .description("Booking " + booking.getId())
                .createdAt(LocalDateTime.now())
                .build());

        timeSlotIds.forEach(timeSlotId -> {
            ParkingSpotSlot slot = parkingSpotSlotRepository
                    .findByParkingSpotIdAndTimeSlotIdAndDate(
                            spotId,
                            UUID.fromString(timeSlotId),
                            LocalDate.parse(date)
                    )
                    .orElseThrow(() -> new NoSuchElementException("Slot not found"));

            slot.setBooking(booking);
            parkingSpotSlotRepository.save(slot);
        });
    }

    public Page<BookingResponse> getUpcoming(UUID userId, Pageable pageable) {
        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("id").ascending()
        );

        return bookingRepository.findUpcomingByUserId(userId, LocalDate.now(), sorted).map(bookingMapper::toResponse);
    }

    public Page<BookingResponse> getArchive(UUID userId, Pageable pageable) {
        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("id").ascending()
        );

        return bookingRepository.findArchiveByUserId(userId, LocalDate.now(), sorted).map(bookingMapper::toResponse);
    }

    public boolean hasActiveBooking(UUID spotId, UUID requesterId){
        return bookingRepository.hasActiveBooking(spotId, requesterId, LocalDate.now());
    }
}
