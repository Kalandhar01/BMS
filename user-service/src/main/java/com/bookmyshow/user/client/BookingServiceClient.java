package com.bookmyshow.user.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import java.util.Map;

@FeignClient(name = "booking-service", url = "http://localhost:8086")
public interface BookingServiceClient {

    @GetMapping("/bookings/user")
    List<Map<String, Object>> getUserBookings(@RequestParam("userId") Long userId);
}
