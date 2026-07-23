package com.bookmyshow.seat.controller;

import com.bookmyshow.seat.dto.SeatRequest;
import com.bookmyshow.seat.dto.SeatResponse;
import com.bookmyshow.seat.dto.SeatMapper;
import com.bookmyshow.seat.dto.ReserveSeatRequest;
import com.bookmyshow.seat.service.SeatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/seats")
public class SeatController {

    private final SeatService s;

    public SeatController(SeatService s) {
        this.s = s;
    }

    @GetMapping
    public ResponseEntity<List<SeatResponse>> getAll() {
        return ResponseEntity.ok(s.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeatResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(s.getById(id));
    }

    @GetMapping("/show/{showId}/layout")
    public ResponseEntity<List<SeatResponse>> getLayout(@PathVariable Long showId) {
        return ResponseEntity.ok(s.getLayoutByShow(showId));
    }

    @GetMapping("/show/{showId}/available")
    public ResponseEntity<List<SeatResponse>> getAvailable(@PathVariable Long showId) {
        return ResponseEntity.ok(s.getAvailableByShow(showId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<List<SeatResponse>> reserve(@RequestBody ReserveSeatRequest body) {
        return ResponseEntity.ok(s.reserveSeats(body.getShowId(), body.getSeatNumbers()));
    }

    @PostMapping("/book")
    public ResponseEntity<List<SeatResponse>> book(@RequestBody ReserveSeatRequest body) {
        return ResponseEntity.ok(s.bookSeats(body.getShowId(), body.getSeatNumbers()));
    }

    @PostMapping("/release")
    public ResponseEntity<Map<String, String>> release(@RequestBody ReserveSeatRequest body) {
        s.releaseSeats(body.getShowId(), body.getSeatNumbers());
        return ResponseEntity.ok(Map.of("message", "Seats released successfully"));
    }

    @GetMapping("/{seatId}/status")
    public ResponseEntity<Map<String, String>> status(@PathVariable Long seatId) {
        String status = s.getSeatStatus(seatId);
        return ResponseEntity.ok(Map.of("seatId", String.valueOf(seatId), "status", status));
    }

    @PostMapping
    public ResponseEntity<SeatResponse> create(@RequestBody SeatRequest req) {
        return ResponseEntity.ok(s.create(req));
    }
}
