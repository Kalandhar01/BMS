package com.bookmyshow.movie.repository;

import com.bookmyshow.movie.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    List<Movie> findByFeaturedTrue();

    List<Movie> findByTrendingTrue();

    List<Movie> findByReleaseDateAfter(LocalDate date);

    List<Movie> findByRatingGreaterThanEqual(double rating);

    List<Movie> findByGenreContainingIgnoreCase(String genre);

    List<Movie> findByLanguageIgnoreCase(String language);

    @Query("SELECT m FROM Movie m WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(m.genre) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(m.language) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Movie> search(@Param("q") String query);
}
