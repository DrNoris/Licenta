package org.example.licenta.application.service;

import org.example.licenta.application.dto.mapper.BookingMapper;
import org.example.licenta.application.dto.request.CreateCheckoutRequest;
import org.example.licenta.application.dto.response.BookingResponse;
import org.example.licenta.domain.model.Booking;
import org.example.licenta.domain.model.ParkingSpot;
import org.example.licenta.infrastructure.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private ParkingSpotRepository parkingSpotRepository;
    @Mock private ParkingSpotSlotRepository parkingSpotSlotRepository;
    @Mock private UserRepository userRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private WalletRepository walletRepository;
    @Mock private WalletTransactionRepository walletTransactionRepository;
    @Mock private BookingMapper bookingMapper;

    @InjectMocks
    private BookingService bookingService;

    private UUID userId;
    private UUID spotId;
    private ParkingSpot parkingSpot;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        spotId = UUID.randomUUID();

        parkingSpot = ParkingSpot.builder()
                .id(spotId)
                .description("Loc parcare centru")
                .address("Strada Eroilor 1, Cluj-Napoca")
                .pricePerHour(10.0)
                .latitude(46.770439)
                .longitude(23.591423)
                .build();

        ReflectionTestUtils.setField(bookingService, "successUrl", "http://localhost:5173/success");
        ReflectionTestUtils.setField(bookingService, "cancelUrl", "http://localhost:5173/cancel");
    }

    // ─────────────────────────────────────────────
    // createCheckoutSession
    // ─────────────────────────────────────────────

    @Test
    void createCheckoutSession_throwsWhenSpotNotFound() {
        CreateCheckoutRequest request = new CreateCheckoutRequest();
        request.setParkingSpotId(spotId.toString());
        request.setDate("2026-06-01");
        request.setTimeSlotIds(List.of(UUID.randomUUID().toString()));

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createCheckoutSession(request, userId))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Parking spot not found");
    }

    // ─────────────────────────────────────────────
    // getUpcoming
    // ─────────────────────────────────────────────

    @Test
    void getUpcoming_returnsPageOfBookingResponses() {
        Booking booking = Booking.builder().build();
        BookingResponse response = new BookingResponse();
        Page<Booking> bookingPage = new PageImpl<>(List.of(booking));
        Pageable pageable = PageRequest.of(0, 5);

        when(bookingRepository.findUpcomingByUserId(eq(userId), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(bookingPage);
        when(bookingMapper.toResponse(booking)).thenReturn(response);

        Page<BookingResponse> result = bookingService.getUpcoming(userId, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0)).isEqualTo(response);
    }

    @Test
    void getUpcoming_returnsEmptyPageWhenNoBookings() {
        Page<Booking> emptyPage = new PageImpl<>(Collections.emptyList());
        Pageable pageable = PageRequest.of(0, 5);

        when(bookingRepository.findUpcomingByUserId(eq(userId), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(emptyPage);

        Page<BookingResponse> result = bookingService.getUpcoming(userId, pageable);

        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void getUpcoming_usesSortedPageable() {
        Page<Booking> emptyPage = new PageImpl<>(Collections.emptyList());
        Pageable pageable = PageRequest.of(0, 5);

        when(bookingRepository.findUpcomingByUserId(eq(userId), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(emptyPage);

        bookingService.getUpcoming(userId, pageable);

        verify(bookingRepository).findUpcomingByUserId(
                eq(userId),
                any(LocalDate.class),
                argThat(p -> p.getSort().equals(Sort.by("id").ascending()))
        );
    }

    // ─────────────────────────────────────────────
    // getArchive
    // ─────────────────────────────────────────────

    @Test
    void getArchive_returnsPageOfBookingResponses() {
        Booking booking = Booking.builder().build();
        BookingResponse response = new BookingResponse();
        Page<Booking> bookingPage = new PageImpl<>(List.of(booking));
        Pageable pageable = PageRequest.of(0, 5);

        when(bookingRepository.findArchiveByUserId(eq(userId), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(bookingPage);
        when(bookingMapper.toResponse(booking)).thenReturn(response);

        Page<BookingResponse> result = bookingService.getArchive(userId, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0)).isEqualTo(response);
    }

    @Test
    void getArchive_returnsEmptyPageWhenNoBookings() {
        Page<Booking> emptyPage = new PageImpl<>(Collections.emptyList());
        Pageable pageable = PageRequest.of(0, 5);

        when(bookingRepository.findArchiveByUserId(eq(userId), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(emptyPage);

        Page<BookingResponse> result = bookingService.getArchive(userId, pageable);

        assertThat(result.getContent()).isEmpty();
    }

    // ─────────────────────────────────────────────
    // hasActiveBooking
    // ─────────────────────────────────────────────

    @Test
    void hasActiveBooking_returnsTrueWhenActiveBookingExists() {
        when(bookingRepository.hasActiveBooking(eq(spotId), eq(userId), any(LocalDate.class)))
                .thenReturn(true);

        boolean result = bookingService.hasActiveBooking(spotId, userId);

        assertThat(result).isTrue();
    }

    @Test
    void hasActiveBooking_returnsFalseWhenNoActiveBooking() {
        when(bookingRepository.hasActiveBooking(eq(spotId), eq(userId), any(LocalDate.class)))
                .thenReturn(false);

        boolean result = bookingService.hasActiveBooking(spotId, userId);

        assertThat(result).isFalse();
    }

    @Test
    void hasActiveBooking_passesTodayAsDateParameter() {
        when(bookingRepository.hasActiveBooking(eq(spotId), eq(userId), any(LocalDate.class)))
                .thenReturn(false);

        bookingService.hasActiveBooking(spotId, userId);

        verify(bookingRepository).hasActiveBooking(
                eq(spotId),
                eq(userId),
                argThat(date -> !date.isAfter(LocalDate.now()))
        );
    }

    // ─────────────────────────────────────────────
    // getActiveBuyerForSpot
    // ─────────────────────────────────────────────

    @Test
    void getActiveBuyerForSpot_returnsUuidWhenActiveBookingExists() {
        UUID buyerId = UUID.randomUUID();
        when(bookingRepository.findActiveBuyerBySpotId(eq(spotId), any(LocalDate.class)))
                .thenReturn(Optional.of(buyerId));

        UUID result = bookingService.getActiveBuyerForSpot(spotId);

        assertThat(result).isEqualTo(buyerId);
    }

    @Test
    void getActiveBuyerForSpot_throwsWhenNoActiveBooking() {
        when(bookingRepository.findActiveBuyerBySpotId(eq(spotId), any(LocalDate.class)))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getActiveBuyerForSpot(spotId))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("No active booking found");
    }
}