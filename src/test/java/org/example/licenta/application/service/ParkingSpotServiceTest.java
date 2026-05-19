package org.example.licenta.application.service;

import org.example.licenta.application.dto.mapper.ParkingSpotMapper;
import org.example.licenta.application.dto.request.CreateParkingSpotRequest;
import org.example.licenta.application.dto.request.UpdateParkingSpotRequest;
import org.example.licenta.application.dto.response.ParkingSpotOwnerResponse;
import org.example.licenta.application.dto.response.ParkingSpotResponse;
import org.example.licenta.domain.model.*;
import org.example.licenta.infrastructure.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParkingSpotServiceTest {

    @Mock private ParkingSpotRepository parkingSpotRepository;
    @Mock private ParkingSpotSlotRepository parkingSpotSlotRepository;
    @Mock private UserRepository userRepository;
    @Mock private TimeSlotRepository timeSlotRepository;
    @Mock private ParkingSpotMapper parkingSpotMapper;
    @Mock private CloudinaryService cloudinaryService;
    @Mock private BookingService bookingService;

    @InjectMocks
    private ParkingSpotService parkingSpotService;

    private UUID ownerId;
    private UUID spotId;
    private UUID requesterId;
    private User owner;
    private ParkingSpot parkingSpot;

    @BeforeEach
    void setUp() {
        ownerId = UUID.randomUUID();
        spotId = UUID.randomUUID();
        requesterId = UUID.randomUUID();

        owner = new User();
        owner.setId(ownerId);
        owner.setUsername("noris");

        parkingSpot = ParkingSpot.builder()
                .id(spotId)
                .description("Loc parcare centru")
                .address("Strada Eroilor 1, Cluj-Napoca")
                .pricePerHour(10.0)
                .latitude(46.770439)
                .longitude(23.591423)
                .owner(owner)
                .build();
    }

    // ─────────────────────────────────────────────
    // getSpotById
    // ─────────────────────────────────────────────

    @Test
    void getSpotById_returnsResponseWhenSpotExists() {
        ParkingSpotResponse response = new ParkingSpotResponse();
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(parkingSpotMapper.toResponse(parkingSpot)).thenReturn(response);

        ParkingSpotResponse result = parkingSpotService.getSpotById(spotId);

        assertThat(result).isNotNull();
    }

    @Test
    void getSpotById_throwsWhenSpotNotFound() {
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> parkingSpotService.getSpotById(spotId))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Parking spot does not exist");
    }

    // ─────────────────────────────────────────────
    // getSpotOwner
    // ─────────────────────────────────────────────

    @Test
    void getSpotOwner_returnsOwnerDetails() {
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));

        ParkingSpotOwnerResponse result = parkingSpotService.getSpotOwner(spotId);

        assertThat(result.getOwnerId()).isEqualTo(ownerId);
        assertThat(result.getOwnerName()).isEqualTo("noris");
        assertThat(result.getSpotAddress()).isEqualTo("Strada Eroilor 1, Cluj-Napoca");
    }

    // ─────────────────────────────────────────────
    // createParkingSpot
    // ─────────────────────────────────────────────

    @Test
    void createParkingSpot_throwsWhenUserNotFound() {
        CreateParkingSpotRequest request = new CreateParkingSpotRequest();
        when(userRepository.findById(ownerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> parkingSpotService.createParkingSpot(request, null, ownerId))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void createParkingSpot_savesSpotWithoutImages() throws IOException {
        CreateParkingSpotRequest request = new CreateParkingSpotRequest();
        ParkingSpotResponse response = new ParkingSpotResponse();

        when(userRepository.findById(ownerId)).thenReturn(Optional.of(owner));
        when(parkingSpotMapper.toEntity(request, owner)).thenReturn(parkingSpot);
        when(parkingSpotRepository.save(any())).thenReturn(parkingSpot);
        when(parkingSpotMapper.toResponse(parkingSpot)).thenReturn(response);

        ParkingSpotResponse result = parkingSpotService.createParkingSpot(request, null, ownerId);

        assertThat(result).isNotNull();
        verify(parkingSpotRepository, times(1)).save(parkingSpot);
        verifyNoInteractions(cloudinaryService);
    }

    // ─────────────────────────────────────────────
    // updateParkingSpot
    // ─────────────────────────────────────────────

    @Test
    void updateParkingSpot_throwsWhenSpotNotFound() {
        UpdateParkingSpotRequest request = new UpdateParkingSpotRequest();
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> parkingSpotService.updateParkingSpot(request, null, ownerId, spotId))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Parking spot not found");
    }

    @Test
    void updateParkingSpot_throwsWhenNotOwner() {
        UpdateParkingSpotRequest request = new UpdateParkingSpotRequest();
        UUID differentUserId = UUID.randomUUID();

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));

        assertThatThrownBy(() -> parkingSpotService.updateParkingSpot(request, null, differentUserId, spotId))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void updateParkingSpot_updatesDescriptionAndPrice() throws IOException {
        UpdateParkingSpotRequest request = new UpdateParkingSpotRequest();
        request.setDescription("Loc parcare nou");
        request.setPricePerHour(15.0);
        ParkingSpotResponse response = new ParkingSpotResponse();

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(parkingSpotRepository.save(any())).thenReturn(parkingSpot);
        when(parkingSpotMapper.toResponse(parkingSpot)).thenReturn(response);

        parkingSpotService.updateParkingSpot(request, null, ownerId, spotId);

        assertThat(parkingSpot.getDescription()).isEqualTo("Loc parcare nou");
        assertThat(parkingSpot.getPricePerHour()).isEqualTo(15.0);
    }

    // ─────────────────────────────────────────────
    // deleteParkingSpot
    // ─────────────────────────────────────────────

    @Test
    void deleteParkingSpot_throwsWhenSpotNotFound() {
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> parkingSpotService.deleteParkingSpot(spotId, ownerId))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Parking spot not found");
    }

    @Test
    void deleteParkingSpot_throwsWhenNotOwner() {
        UUID differentUserId = UUID.randomUUID();
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));

        assertThatThrownBy(() -> parkingSpotService.deleteParkingSpot(spotId, differentUserId))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deleteParkingSpot_throwsWhenUpcomingBookingsExist() {
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(parkingSpotSlotRepository.hasUpcomingBookings(eq(spotId), any(LocalDate.class)))
                .thenReturn(true);

        assertThatThrownBy(() -> parkingSpotService.deleteParkingSpot(spotId, ownerId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot delete a parking spot with upcoming bookings");
    }

    @Test
    void deleteParkingSpot_deletesSuccessfullyWhenNoUpcomingBookings() throws IOException {
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(parkingSpotSlotRepository.hasUpcomingBookings(eq(spotId), any(LocalDate.class)))
                .thenReturn(false);

        parkingSpotService.deleteParkingSpot(spotId, ownerId);

        verify(parkingSpotRepository).delete(parkingSpot);
    }

    // ─────────────────────────────────────────────
    // getSignedImageUrls
    // ─────────────────────────────────────────────

    @Test
    void getSignedImageUrls_throwsWhenNeitherOwnerNorPaidCustomer() {
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(bookingService.hasActiveBooking(spotId, requesterId)).thenReturn(false);

        assertThatThrownBy(() -> parkingSpotService.getSignedImageUrls(requesterId, spotId))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void getSignedImageUrls_returnsUrlsForOwner() throws AccessDeniedException {
        ParkingSpotImage image = ParkingSpotImage.builder()
                .publicId("parking-spots/abc123")
                .parkingSpot(parkingSpot)
                .build();
        parkingSpot.getImages().add(image);

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(cloudinaryService.generateSignedUrl("parking-spots/abc123")).thenReturn("https://signed-url.com/abc123");

        List<String> result = parkingSpotService.getSignedImageUrls(ownerId, spotId);

        assertThat(result).containsExactly("https://signed-url.com/abc123");
    }

    @Test
    void getSignedImageUrls_returnsUrlsForBuyerWithActiveBooking() throws AccessDeniedException {
        ParkingSpotImage image = ParkingSpotImage.builder()
                .publicId("parking-spots/abc123")
                .parkingSpot(parkingSpot)
                .build();
        parkingSpot.getImages().add(image);

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(bookingService.hasActiveBooking(spotId, requesterId)).thenReturn(true);
        when(cloudinaryService.generateSignedUrl("parking-spots/abc123")).thenReturn("https://signed-url.com/abc123");

        List<String> result = parkingSpotService.getSignedImageUrls(requesterId, spotId);

        assertThat(result).containsExactly("https://signed-url.com/abc123");
    }
}