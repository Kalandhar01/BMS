package com.bookmyshow.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@FeignClient(name = "seat-service", url = "http://localhost:8085")
public interface SeatServiceClient {

    @GetMapping("/seats/show/{showId}/layout")
    List<Map<String, Object>> getSeatsByShow(@PathVariable("showId") Long showId);

    @PostMapping("/seats/reserve")
    List<Map<String, Object>> reserveSeats(@RequestBody Map<String, Object> body);

    @PostMapping("/seats/book")
    List<Map<String, Object>> bookSeats(@RequestBody Map<String, Object> body);
}
