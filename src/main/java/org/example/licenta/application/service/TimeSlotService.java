package org.example.licenta.application.service;

import lombok.RequiredArgsConstructor;
import org.example.licenta.application.dto.mapper.TimeSlotMapper;
import org.example.licenta.application.dto.response.TimeSlotResponse;
import org.example.licenta.infrastructure.repository.TimeSlotRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimeSlotService {
    private final TimeSlotMapper timeSlotMapper;
    private final TimeSlotRepository timeSlotRepository;

    public List<TimeSlotResponse> getAllSlots() {
        return timeSlotRepository.findAll().stream().map(timeSlotMapper::toResponse).toList();
    }
}
