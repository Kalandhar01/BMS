package com.bookmyshow.screen.controller;

import com.bookmyshow.screen.dto.ScreenRequest;
import com.bookmyshow.screen.dto.ScreenResponse;
import com.bookmyshow.screen.dto.ScreenMapper;
import com.bookmyshow.screen.service.ScreenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/screens")
public class ScreenController {

    private final ScreenService s;

    public ScreenController(ScreenService s) {
        this.s = s;
    }

    @GetMapping
    public ResponseEntity<List<ScreenResponse>> getAll() {
        return ResponseEntity.ok(s.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(s.getById(id));
    }

    @GetMapping("/theatres")
    public ResponseEntity<List<ScreenResponse>> getTheatres() {
        return ResponseEntity.ok(s.getTheatres());
    }

    @GetMapping("/theatre-names")
    public ResponseEntity<List<String>> getTheatreNames() {
        return ResponseEntity.ok(s.getTheatreNames());
    }

    @PostMapping
    public ResponseEntity<ScreenResponse> create(@RequestBody ScreenRequest req) {
        return ResponseEntity.ok(s.create(req));
    }
}
