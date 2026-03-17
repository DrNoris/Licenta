package org.example.licenta.presentation;

import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.request.CreateCheckoutRequest;
import org.example.licenta.application.service.BookingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
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
    public ResponseEntity<Void> webhook(
            HttpServletRequest request,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            byte[] bytes = request.getInputStream().readAllBytes();
            String payload = new String(bytes, StandardCharsets.UTF_8);

            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            log.info("Event type raw: '{}'", event.getType());
            log.info("Event type length: {}", event.getType().length());
            log.info("Equals check: {}", "checkout.session.completed".equals(event.getType()));

            switch (event.getType()) {
                case "checkout.session.completed" -> {
                    log.info("ENTERED checkout.session.completed");

                    EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
                    Session session = (Session) deserializer.deserializeUnsafe();

                    bookingService.fulfillBooking(session);
                }

                default -> log.info("Unhandled event: '{}'", event.getType());
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("WEBHOOK EXCEPTION: {}", e.getMessage());
            log.error("Stack trace: ", e);  // ← full stack trace
            return ResponseEntity.badRequest().build();
        }
    }
}