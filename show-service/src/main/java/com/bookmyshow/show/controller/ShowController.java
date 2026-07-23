package com.bookmyshow.show.controller;

import com.bookmyshow.show.dto.ShowRequest;
import com.bookmyshow.show.dto.ShowResponse;
import com.bookmyshow.show.dto.ShowMapper;
import com.bookmyshow.show.service.ShowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/shows")
public class ShowController {

    private final ShowService s;

    public ShowController(ShowService s) {
        this.s = s;
    }

    @GetMapping
    public ResponseEntity<List<ShowResponse>> getAll() {
        return ResponseEntity.ok(s.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(s.getById(id));
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ShowResponse>> getByMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(s.getByMovie(movieId));
    }

    @GetMapping("/date")
    public ResponseEntity<List<ShowResponse>> getByDate(@RequestParam("date") String date) {
        return ResponseEntity.ok(s.getByDate(LocalDate.parse(date)));
    }

    @GetMapping("/theatre/{theatreId}")
    public ResponseEntity<List<ShowResponse>> getByTheatre(@PathVariable Long theatreId) {
        return ResponseEntity.ok(s.getByTheatre(theatreId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ShowResponse>> search(@RequestParam(value = "movieId", required = false) Long movieId,
                                              @RequestParam(value = "date", required = false) String date,
                                              @RequestParam(value = "screenId", required = false) Long screenId) {
        LocalDate d = date != null ? LocalDate.parse(date) : null;
        return ResponseEntity.ok(s.search(movieId, d, screenId));
    }

    @PostMapping
    public ResponseEntity<ShowResponse> create(@RequestBody ShowRequest req) {
        return ResponseEntity.ok(s.create(req));
    }
}
