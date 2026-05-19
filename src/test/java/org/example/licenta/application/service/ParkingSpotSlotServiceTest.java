package org.example.licenta.application.service;

import org.example.licenta.application.dto.mapper.AvailabilityMapper;
import org.example.licenta.application.dto.mapper.ParkingSpotSlotMapper;
import org.example.licenta.application.dto.request.AddAvailabilityRequest;
import org.example.licenta.application.dto.response.AvailabilityResponse;
import org.example.licenta.application.dto.response.ParkingSpotSlotResponse;
import org.example.licenta.domain.model.*;
import org.example.licenta.infrastructure.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParkingSpotSlotServiceTest {

    @Mock private ParkingSpotSlotRepository parkingSpotSlotRepository;
    @Mock private ParkingSpotRepository parkingSpotRepository;
    @Mock private TimeSlotRepository timeSlotRepository;
    @Mock private ParkingSpotSlotMapper parkingSpotSlotMapper;
    @Mock private AvailabilityMapper availabilityMapper;

    @InjectMocks
    private ParkingSpotSlotService parkingSpotSlotService;

    private UUID ownerId;
    private UUID spotId;
    private User owner;
    private ParkingSpot parkingSpot;

    @BeforeEach
    void setUp() {
        ownerId = UUID.randomUUID();
        spotId = UUID.randomUUID();

        owner = new User();
        owner.setId(ownerId);

        parkingSpot = ParkingSpot.builder()
                .id(spotId)
                .owner(owner)
                .build();
    }

    // ─────────────────────────────────────────────
    // getAvailability
    // ─────────────────────────────────────────────

    @Test
    void getAvailability_returnsSlotsForFutureDate() {
        LocalDate futureDate = LocalDate.now().plusDays(3);
        List<ParkingSpotSlot> slots = List.of(new ParkingSpotSlot());
        AvailabilityResponse response = new AvailabilityResponse();

        when(parkingSpotSlotRepository.findByParkingSpotIdAndDateAndBookingIsNull(spotId, futureDate))
                .thenReturn(slots);
        when(availabilityMapper.toAvailabilityResponse(slots, futureDate)).thenReturn(response);

        AvailabilityResponse result = parkingSpotSlotService.getAvailability(spotId, futureDate);

        assertThat(result).isNotNull();
        verify(availabilityMapper).toAvailabilityResponse(slots, futureDate);
    }

    @Test
    void getAvailability_filtersExpiredSlotsForToday() {
        LocalDate today = LocalDate.now();
        AvailabilityResponse response = new AvailabilityResponse();

        TimeSlot pastTimeSlot = new TimeSlot();
        pastTimeSlot.setEndHour(0); // ora 0 — deja expirat

        TimeSlot futureTimeSlot = new TimeSlot();
        futureTimeSlot.setEndHour(23); // ora 23 — valid

        ParkingSpotSlot pastSlot = new ParkingSpotSlot();
        pastSlot.setTimeSlot(pastTimeSlot);

        ParkingSpotSlot futureSlot = new ParkingSpotSlot();
        futureSlot.setTimeSlot(futureTimeSlot);

        when(parkingSpotSlotRepository.findByParkingSpotIdAndDateAndBookingIsNull(spotId, today))
                .thenReturn(List.of(pastSlot, futureSlot));
        when(availabilityMapper.toAvailabilityResponse(anyList(), eq(today))).thenReturn(response);

        parkingSpotSlotService.getAvailability(spotId, today);

        verify(availabilityMapper).toAvailabilityResponse(
                argThat(list -> list.size() == 1 && list.get(0).getTimeSlot().getEndHour() == 23),
                eq(today)
        );
    }

    // ─────────────────────────────────────────────
    // getAllSlotsForDate
    // ─────────────────────────────────────────────

    @Test
    void getAllSlotsForDate_throwsWhenSpotNotFound() {
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> parkingSpotSlotService.getAllSlotsForDate(ownerId, spotId, LocalDate.now()))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Parking spot does not exist");
    }

    @Test
    void getAllSlotsForDate_throwsWhenNotOwner() {
        UUID differentUserId = UUID.randomUUID();
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));

        assertThatThrownBy(() -> parkingSpotSlotService.getAllSlotsForDate(differentUserId, spotId, LocalDate.now()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void getAllSlotsForDate_returnsSlotResponsesForOwner() throws AccessDeniedException {
        LocalDate date = LocalDate.now();
        List<ParkingSpotSlot> slots = List.of(new ParkingSpotSlot());
        List<ParkingSpotSlotResponse> responses = List.of(new ParkingSpotSlotResponse());

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(parkingSpotSlotRepository.findByParkingSpotIdAndDate(spotId, date)).thenReturn(slots);
        when(parkingSpotSlotMapper.toResponseList(slots)).thenReturn(responses);

        List<ParkingSpotSlotResponse> result = parkingSpotSlotService.getAllSlotsForDate(ownerId, spotId, date);

        assertThat(result).hasSize(1);
    }

    // ─────────────────────────────────────────────
    // createParkingSpotAvailability
    // ─────────────────────────────────────────────

    @Test
    void createParkingSpotAvailability_throwsWhenSpotNotFound() {
        AddAvailabilityRequest request = new AddAvailabilityRequest();
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> parkingSpotSlotService.createParkingSpotAvailability(spotId, request, ownerId))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Parking spot not found");
    }

    @Test
    void createParkingSpotAvailability_throwsWhenNotOwner() {
        UUID differentUserId = UUID.randomUUID();
        AddAvailabilityRequest request = new AddAvailabilityRequest();
        request.setDates(List.of(LocalDate.now().plusDays(1)));
        request.setTimeSlotIds(List.of(UUID.randomUUID()));

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));

        assertThatThrownBy(() -> parkingSpotSlotService.createParkingSpotAvailability(spotId, request, differentUserId))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void createParkingSpotAvailability_skipsDuplicateSlots() throws AccessDeniedException {
        UUID timeSlotId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);

        AddAvailabilityRequest request = new AddAvailabilityRequest();
        request.setDates(List.of(date));
        request.setTimeSlotIds(List.of(timeSlotId));

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setId(timeSlotId);

        // slot deja existent
        ParkingSpotSlot existingSlot = new ParkingSpotSlot();
        existingSlot.setDate(date);
        existingSlot.setTimeSlot(timeSlot);

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(parkingSpotSlotRepository.findAllByParkingSpotIdAndTimeSlotIdInAndDateIn(
                eq(spotId), anyList(), anyList())).thenReturn(List.of(existingSlot));
        when(timeSlotRepository.findAllById(anyList())).thenReturn(List.of(timeSlot));

        parkingSpotSlotService.createParkingSpotAvailability(spotId, request, ownerId);

        verify(parkingSpotSlotRepository).saveAll(argThat(list -> ((List<?>) list).isEmpty()));
    }

    @Test
    void createParkingSpotAvailability_savesNewSlots() throws AccessDeniedException {
        UUID timeSlotId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);

        AddAvailabilityRequest request = new AddAvailabilityRequest();
        request.setDates(List.of(date));
        request.setTimeSlotIds(List.of(timeSlotId));

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setId(timeSlotId);

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(parkingSpotSlotRepository.findAllByParkingSpotIdAndTimeSlotIdInAndDateIn(
                eq(spotId), anyList(), anyList())).thenReturn(Collections.emptyList());
        when(timeSlotRepository.findAllById(anyList())).thenReturn(List.of(timeSlot));

        parkingSpotSlotService.createParkingSpotAvailability(spotId, request, ownerId);

        verify(parkingSpotSlotRepository).saveAll(argThat(list -> ((List<?>) list).size() == 1));
    }

    // ─────────────────────────────────────────────
    // deleteParkingSpotAvailability
    // ─────────────────────────────────────────────

    @Test
    void deleteParkingSpotAvailability_throwsWhenSpotNotFound() {
        AddAvailabilityRequest request = new AddAvailabilityRequest();
        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> parkingSpotSlotService.deleteParkingSpotAvailability(spotId, request, ownerId))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Parking spot not found");
    }

    @Test
    void deleteParkingSpotAvailability_throwsWhenNotOwner() {
        UUID differentUserId = UUID.randomUUID();
        AddAvailabilityRequest request = new AddAvailabilityRequest();
        request.setDates(List.of(LocalDate.now().plusDays(1)));
        request.setTimeSlotIds(List.of(UUID.randomUUID()));

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));

        assertThatThrownBy(() -> parkingSpotSlotService.deleteParkingSpotAvailability(spotId, request, differentUserId))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deleteParkingSpotAvailability_deletesOnlyUnbookedSlots() throws AccessDeniedException {
        UUID timeSlotId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);

        AddAvailabilityRequest request = new AddAvailabilityRequest();
        request.setDates(List.of(date));
        request.setTimeSlotIds(List.of(timeSlotId));

        ParkingSpotSlot freeSlot = new ParkingSpotSlot();
        freeSlot.setBooking(null);

        ParkingSpotSlot bookedSlot = new ParkingSpotSlot();
        bookedSlot.setBooking(new Booking());

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(parkingSpotSlotRepository.findAllByParkingSpotIdAndTimeSlotIdInAndDateIn(
                eq(spotId), anyList(), anyList())).thenReturn(List.of(freeSlot, bookedSlot));

        parkingSpotSlotService.deleteParkingSpotAvailability(spotId, request, ownerId);

        verify(parkingSpotSlotRepository).deleteAll(argThat(list -> {
            List<?> l = (List<?>) list;
            return l.size() == 1 && l.get(0) == freeSlot;
        }));
    }

    @Test
    void deleteParkingSpotAvailability_deletesNothingWhenAllSlotsBooked() throws AccessDeniedException {
        UUID timeSlotId = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(1);

        AddAvailabilityRequest request = new AddAvailabilityRequest();
        request.setDates(List.of(date));
        request.setTimeSlotIds(List.of(timeSlotId));

        ParkingSpotSlot bookedSlot = new ParkingSpotSlot();
        bookedSlot.setBooking(new Booking());

        when(parkingSpotRepository.findById(spotId)).thenReturn(Optional.of(parkingSpot));
        when(parkingSpotSlotRepository.findAllByParkingSpotIdAndTimeSlotIdInAndDateIn(
                eq(spotId), anyList(), anyList())).thenReturn(List.of(bookedSlot));

        parkingSpotSlotService.deleteParkingSpotAvailability(spotId, request, ownerId);

        verify(parkingSpotSlotRepository).deleteAll(argThat(list -> ((List<?>) list).isEmpty()));
    }
}