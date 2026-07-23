package com.bookmyshow.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import java.util.Map;

@FeignClient(name = "booking-service", url = "http://localhost:8086")
public interface BookingServiceClient {

    @PutMapping("/bookings/{id}/confirm")
    Map<String, Object> confirmBooking(@PathVariable("id") Long id);
}
