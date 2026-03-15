package org.example.licenta.application.service;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.request.CreateCheckoutRequest;
import org.example.licenta.domain.enums.BookingStatus;
import org.example.licenta.domain.model.Booking;
import org.example.licenta.domain.model.ParkingSpot;
import org.example.licenta.domain.model.ParkingSpotSlot;
import org.example.licenta.domain.model.User;
import org.example.licenta.infrastructure.repository.BookingRepository;
import org.example.licenta.infrastructure.repository.ParkingSpotRepository;
import org.example.licenta.infrastructure.repository.ParkingSpotSlotRepository;
import org.example.licenta.infrastructure.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final ParkingSpotSlotRepository parkingSpotSlotRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

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

        // Calculate total price
        double totalPrice = timeSlotIds.size() * parkingSpotRepository
                .findById(spotId)
                .orElseThrow()
                .getPricePerHour();

        // Create one booking for all slots
        Booking booking = Booking.builder()
                .client(client)
                .totalPrice(totalPrice)
                .status(BookingStatus.CONFIRMED)
                .build();

        // Link each slot to this booking
        timeSlotIds.forEach(timeSlotId -> {
            ParkingSpotSlot slot = parkingSpotSlotRepository
                    .findByParkingSpotIdAndTimeSlotIdAndDate(
                            spotId,
                            UUID.fromString(timeSlotId),
                            LocalDate.parse(date)
                    )
                    .orElseThrow(() -> new NoSuchElementException("Slot not found"));

            slot.setBooking(booking);
            booking.getReservedSlots().add(slot);
        });

        bookingRepository.save(booking);
    }
}
