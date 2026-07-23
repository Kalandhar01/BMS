package com.bookmyshow.show.repository;

import com.bookmyshow.show.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {
    List<Show> findByMovieId(Long movieId);
    List<Show> findByShowDate(LocalDate date);
    List<Show> findByScreenId(Long screenId);
}
