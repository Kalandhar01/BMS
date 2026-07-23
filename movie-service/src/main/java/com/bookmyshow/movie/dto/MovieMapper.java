package com.bookmyshow.movie.dto;

import com.bookmyshow.movie.entity.Movie;
import java.time.LocalDate;

public class MovieMapper {

    public static MovieResponse toResponse(Movie m) {
        if (m == null) return null;
        MovieResponse r = new MovieResponse();
        r.setId(m.getId());
        r.setTitle(m.getTitle());
        r.setGenre(m.getGenre());
        r.setLanguage(m.getLanguage());
        r.setDuration(m.getDuration());
        r.setPoster(m.getPoster());
        r.setBackdrop(m.getBackdrop());
        r.setRating(m.getRating());
        r.setReleaseDate(m.getReleaseDate());
        r.setFeatured(m.isFeatured());
        r.setTrending(m.isTrending());
        return r;
    }

    public static Movie toEntity(MovieRequest req) {
        if (req == null) return null;
        Movie m = new Movie();
        m.setTitle(req.getTitle());
        m.setGenre(req.getGenre());
        m.setLanguage(req.getLanguage());
        m.setDuration(req.getDuration());
        m.setPoster(req.getPoster());
        m.setBackdrop(req.getBackdrop());
        m.setRating(req.getRating());
        m.setReleaseDate(req.getReleaseDate() != null ? LocalDate.parse(req.getReleaseDate()) : null);
        m.setFeatured(req.isFeatured());
        m.setTrending(req.isTrending());
        return m;
    }

    public static Movie toEntity(MovieRequest req, Movie m) {
        if (req == null) return m;
        if (req.getTitle() != null) m.setTitle(req.getTitle());
        if (req.getGenre() != null) m.setGenre(req.getGenre());
        if (req.getLanguage() != null) m.setLanguage(req.getLanguage());
        if (req.getDuration() > 0) m.setDuration(req.getDuration());
        if (req.getPoster() != null) m.setPoster(req.getPoster());
        if (req.getBackdrop() != null) m.setBackdrop(req.getBackdrop());
        if (req.getRating() > 0) m.setRating(req.getRating());
        if (req.getReleaseDate() != null) m.setReleaseDate(LocalDate.parse(req.getReleaseDate()));
        m.setFeatured(req.isFeatured());
        m.setTrending(req.isTrending());
        return m;
    }
}
