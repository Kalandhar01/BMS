package com.bookmyshow.seat.service;

import com.bookmyshow.seat.dto.SeatRequest;
import com.bookmyshow.seat.dto.SeatResponse;
import java.util.List;

public interface SeatService {
    SeatResponse create(SeatRequest req);
    List<SeatResponse> getAll();
    SeatResponse getById(Long id);
    List<SeatResponse> getLayoutByShow(Long showId);
    List<SeatResponse> getAvailableByShow(Long showId);
    List<SeatResponse> reserveSeats(Long showId, List<String> seatNumbers);
    void releaseSeats(Long showId, List<String> seatNumbers);
    List<SeatResponse> bookSeats(Long showId, List<String> seatNumbers);
    String getSeatStatus(Long seatId);
}
