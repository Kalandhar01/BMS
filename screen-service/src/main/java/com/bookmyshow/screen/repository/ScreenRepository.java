package com.bookmyshow.screen.repository;

import com.bookmyshow.screen.entity.Screen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ScreenRepository extends JpaRepository<Screen, Long> {
    List<Screen> findByTheatreNameContainingIgnoreCase(String theatreName);
    @Query("SELECT DISTINCT s.theatreName FROM Screen s")
    List<String> findDistinctTheatreNames();
}
