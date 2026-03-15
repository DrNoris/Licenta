package org.example.licenta.presentation;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.response.TimeSlotResponse;
import org.example.licenta.application.service.TimeSlotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/time-slot")
@RequiredArgsConstructor
public class TimeSlotController {
    private final TimeSlotService timeSlotService;

    @GetMapping
    public ResponseEntity<List<TimeSlotResponse>> getAllSlots() {
        List<TimeSlotResponse> response = timeSlotService.getAllSlots();

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}