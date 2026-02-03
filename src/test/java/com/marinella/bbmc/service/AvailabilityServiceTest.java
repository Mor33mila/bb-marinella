package com.marinella.bbmc.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class AvailabilityServiceTest {

    @Test
    void testGetBlockedDates() {
        AvailabilityService service = new AvailabilityService();
        // This relies on the hardcoded URL being reachable.
        // In a real test we would mock the URL connection or use a local file.
        // For this smoke test, we just check if it returns a list (empty or not).
        List<LocalDate> dates = service.getBlockedDates("stanza1");
        assertNotNull(dates);
        System.out.println("Found " + dates.size() + " blocked dates for stanza1");
    }
}
