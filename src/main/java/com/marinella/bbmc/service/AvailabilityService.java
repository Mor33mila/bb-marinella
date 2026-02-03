package com.marinella.bbmc.service;

import net.fortuna.ical4j.data.CalendarBuilder;
import net.fortuna.ical4j.model.Calendar;
import net.fortuna.ical4j.model.Component;
import net.fortuna.ical4j.model.Date;
import net.fortuna.ical4j.model.component.VEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AvailabilityService {
    private static final Logger logger = LoggerFactory.getLogger(AvailabilityService.class);

    @org.springframework.beans.factory.annotation.Value("${ical.room.stanza1}")
    private String stanza1Url;

    @org.springframework.beans.factory.annotation.Value("${ical.room.stanza2}")
    private String stanza2Url;

    private final Map<String, String> roomIcalUrls = new HashMap<>();

    @jakarta.annotation.PostConstruct
    public void init() {
        roomIcalUrls.put("stanza1", stanza1Url);
        roomIcalUrls.put("stanza2", stanza2Url);
    }

    public List<LocalDate> getBlockedDates(String roomId) {
        String icalUrl = roomIcalUrls.get(roomId);
        if (icalUrl == null || icalUrl.isEmpty()) {
            return new ArrayList<>();
        }

        List<LocalDate> blockedDates = new ArrayList<>();
        try {
            logger.info("Fetching iCal data for room {} from URL: {}", roomId, icalUrl);
            InputStream is = java.net.URI.create(icalUrl).toURL().openStream();
            CalendarBuilder builder = new CalendarBuilder();
            Calendar calendar = builder.build(is);
            logger.info("iCal data successfully fetched and parsed for room {}", roomId);

            for (Object o : calendar.getComponents(Component.VEVENT)) {
                VEvent event = (VEvent) o;
                if (event.getStartDate() != null && event.getEndDate() != null) {
                    Date startDate = event.getStartDate().getDate();
                    Date endDate = event.getEndDate().getDate();

                    LocalDate start = startDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    LocalDate end = endDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

                    // Booking.com usually returns end date as exclusive (check-out date),
                    // so we account for that.
                    while (start.isBefore(end)) {
                        blockedDates.add(start);
                        start = start.plusDays(1);
                    }
                }
            }
            logger.info("Found {} blocked dates for room {}", blockedDates.size(), roomId);
        } catch (Exception e) {
            logger.error("Error fetching or parsing iCal data for room {}: {}", roomId, e.getMessage(), e);
        }
        return blockedDates;
    }
}
