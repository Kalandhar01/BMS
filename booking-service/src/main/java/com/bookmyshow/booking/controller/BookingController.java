package com.bookmyshow.booking.controller;

import com.bookmyshow.booking.dto.BookingRequest;
import com.bookmyshow.booking.dto.BookingResponse;
import com.bookmyshow.booking.dto.BookingMapper;
import com.bookmyshow.booking.dto.CalculateRequest;
import com.bookmyshow.booking.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService s;

    public BookingController(BookingService s) { this.s = s; }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAll() {
        return ResponseEntity.ok(s.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(s.getById(id));
    }

    @GetMapping("/user")
    public ResponseEntity<List<BookingResponse>> getByUser(@RequestParam("userId") Long userId) {
        return ResponseEntity.ok(s.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@RequestBody BookingRequest req) {
        return ResponseEntity.ok(s.create(req));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(s.cancelBooking(id));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<BookingResponse> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(s.confirmBooking(id));
    }

    @PostMapping("/calculate")
    public ResponseEntity<Map<String, BigDecimal>> calculate(@RequestBody CalculateRequest req) {
        BigDecimal amount = s.calculateAmount(req.getShowId(), req.getSeatNumbers());
        return ResponseEntity.ok(Map.of("amount", amount));
    }
}
