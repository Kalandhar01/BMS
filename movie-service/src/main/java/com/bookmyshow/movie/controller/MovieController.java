package com.bookmyshow.movie.controller;

import com.bookmyshow.movie.dto.MovieRequest;
import com.bookmyshow.movie.dto.MovieResponse;
import com.bookmyshow.movie.dto.MovieMapper;
import com.bookmyshow.movie.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movies")
public class MovieController {

    private final MovieService service;

    public MovieController(MovieService s) {
        this.service = s;
    }

    @GetMapping
    public ResponseEntity<List<MovieResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<MovieResponse>> getFeatured() {
        return ResponseEntity.ok(service.getFeatured());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<MovieResponse>> getTrending() {
        return ResponseEntity.ok(service.getTrending());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<MovieResponse>> getUpcoming() {
        return ResponseEntity.ok(service.getUpcoming());
    }

    @GetMapping("/popular")
    public ResponseEntity<List<MovieResponse>> getPopular() {
        return ResponseEntity.ok(service.getPopular());
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<MovieResponse>> getByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(service.getByGenre(genre));
    }

    @GetMapping("/language/{lang}")
    public ResponseEntity<List<MovieResponse>> getByLanguage(@PathVariable String lang) {
        return ResponseEntity.ok(service.getByLanguage(lang));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MovieResponse>> search(@RequestParam("q") String query) {
        return ResponseEntity.ok(service.search(query));
    }

    @PostMapping
    public ResponseEntity<MovieResponse> create(@RequestBody MovieRequest req) {
        return ResponseEntity.ok(service.create(req));
    }
}
