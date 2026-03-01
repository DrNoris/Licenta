package org.example.licenta.infrastructure.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.licenta.domain.model.TimeSlot;
import org.example.licenta.infrastructure.repository.TimeSlotRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TimeSlotSeeder implements ApplicationRunner {

    private final TimeSlotRepository timeSlotRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (timeSlotRepository.count() > 0) {
            log.info("TimeSlot table already seeded — skipping.");
            return;
        }

        List<TimeSlot> slots = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            slots.add(TimeSlot.builder()
                    .startHour(hour)
                    .endHour(hour + 1)
                    .build());
        }

        timeSlotRepository.saveAll(slots);
        log.info("TimeSlot table seeded with 24 hourly slots (00:00–01:00 through 23:00–24:00).");
    }
}