package org.example.licenta.presentation;

import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.request.CreateCheckoutRequest;
import org.example.licenta.application.dto.response.BookingResponse;
import org.example.licenta.application.service.BookingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> checkout(@RequestBody CreateCheckoutRequest request, Authentication authentication) throws StripeException {
        UUID userId = UUID.fromString(authentication.getName());
        String url = bookingService.createCheckoutSession(request, userId);

        return ResponseEntity.ok(Map.of("checkoutUrl", url));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(HttpServletRequest request, @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            byte[] bytes = request.getInputStream().readAllBytes();
            String payload = new String(bytes, StandardCharsets.UTF_8);

            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            switch (event.getType()) {
                case "checkout.session.completed" -> {
                    EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
                    Session session = (Session) deserializer.deserializeUnsafe();

                    bookingService.fulfillBooking(session);
                }
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/upcoming")
    public ResponseEntity<Page<BookingResponse>> getUpcoming(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        Pageable pageable = PageRequest.of(page, size, Sort.by("reservedSlots.date").ascending());
        Page<BookingResponse> result = bookingService.getUpcoming(userId, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/archive")
    public ResponseEntity<Page<BookingResponse>> getArchive(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        Pageable pageable = PageRequest.of(page, size, Sort.by("reservedSlots.date").ascending());
        Page<BookingResponse> result = bookingService.getArchive(userId, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/bookings/validate")
    public ResponseEntity<Boolean> validateBooking(@RequestParam UUID spotId, @RequestParam UUID buyerId) {
        boolean valid = bookingService.hasActiveBooking(spotId, buyerId);

        return ResponseEntity.ok(valid);
    }

    @GetMapping("/api/bookings/buyer")
    public ResponseEntity<UUID> getBuyerForSpot(@RequestParam UUID spotId) {
        UUID buyerId = bookingService.getActiveBuyerForSpot(spotId);
        return ResponseEntity.ok(buyerId);
    }
}