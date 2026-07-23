package com.bookmyshow.seat.repository;

import com.bookmyshow.seat.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByShowId(Long showId);
    List<Seat> findByShowIdAndStatus(Long showId, String status);
    Seat findByShowIdAndSeatNumber(Long showId, String seatNumber);
}
