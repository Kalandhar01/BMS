package com.bookmyshow.movie.service.impl;

import com.bookmyshow.movie.dto.MovieRequest;
import com.bookmyshow.movie.dto.MovieResponse;
import com.bookmyshow.movie.dto.MovieMapper;
import com.bookmyshow.movie.entity.Movie;
import com.bookmyshow.movie.repository.MovieRepository;
import com.bookmyshow.movie.service.MovieService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MovieServiceImpl implements MovieService {

    private final MovieRepository repo;

    public MovieServiceImpl(MovieRepository r) { this.repo = r; }

    @Override
    public MovieResponse create(MovieRequest req) {
        Movie m = MovieMapper.toEntity(req);
        m.setBackdrop(m.getBackdrop() != null ? m.getBackdrop() : "");
        m.setPoster(m.getPoster() != null ? m.getPoster() : "");
        return MovieMapper.toResponse(repo.save(m));
    }

    @Override
    public MovieResponse getById(Long id) {
        return MovieMapper.toResponse(repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Movie not found: " + id)));
    }

    @Override
    public List<MovieResponse> getAll() {
        return repo.findAll().stream().map(MovieMapper::toResponse).toList();
    }

    @Override
    public List<MovieResponse> getFeatured() {
        return repo.findByFeaturedTrue().stream().map(MovieMapper::toResponse).toList();
    }

    @Override
    public List<MovieResponse> getTrending() {
        return repo.findByTrendingTrue().stream().map(MovieMapper::toResponse).toList();
    }

    @Override
    public List<MovieResponse> getUpcoming() {
        return repo.findByReleaseDateAfter(LocalDate.now()).stream().map(MovieMapper::toResponse).toList();
    }

    @Override
    public List<MovieResponse> getPopular() {
        return repo.findByRatingGreaterThanEqual(8.0).stream().map(MovieMapper::toResponse).toList();
    }

    @Override
    public List<MovieResponse> getByGenre(String genre) {
        return repo.findByGenreContainingIgnoreCase(genre).stream().map(MovieMapper::toResponse).toList();
    }

    @Override
    public List<MovieResponse> getByLanguage(String language) {
        return repo.findByLanguageIgnoreCase(language).stream().map(MovieMapper::toResponse).toList();
    }

    @Override
    public List<MovieResponse> search(String query) {
        return repo.search(query).stream().map(MovieMapper::toResponse).toList();
    }
}
