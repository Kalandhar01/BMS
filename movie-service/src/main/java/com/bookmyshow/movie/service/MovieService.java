package com.bookmyshow.movie.service;

import com.bookmyshow.movie.dto.MovieRequest;
import com.bookmyshow.movie.dto.MovieResponse;
import java.util.List;

public interface MovieService {
    MovieResponse create(MovieRequest req);
    MovieResponse getById(Long id);
    List<MovieResponse> getAll();
    List<MovieResponse> getFeatured();
    List<MovieResponse> getTrending();
    List<MovieResponse> getUpcoming();
    List<MovieResponse> getPopular();
    List<MovieResponse> getByGenre(String genre);
    List<MovieResponse> getByLanguage(String language);
    List<MovieResponse> search(String query);
}
