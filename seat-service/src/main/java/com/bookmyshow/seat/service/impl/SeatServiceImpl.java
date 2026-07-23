package com.bookmyshow.seat.service.impl;

import com.bookmyshow.seat.dto.SeatRequest;
import com.bookmyshow.seat.dto.SeatResponse;
import com.bookmyshow.seat.dto.SeatMapper;
import com.bookmyshow.seat.entity.Seat;
import com.bookmyshow.seat.repository.SeatRepository;
import com.bookmyshow.seat.service.SeatService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeatServiceImpl implements SeatService {

    private final SeatRepository repo;

    public SeatServiceImpl(SeatRepository r) { this.repo = r; }

    @Override
    public SeatResponse create(SeatRequest req) {
        return SeatMapper.toResponse(repo.save(SeatMapper.toEntity(req)));
    }

    @Override
    public List<SeatResponse> getAll() {
        return repo.findAll().stream().map(SeatMapper::toResponse).toList();
    }

    @Override
    public SeatResponse getById(Long id) {
        return SeatMapper.toResponse(repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Seat not found: " + id)));
    }

    @Override
    public List<SeatResponse> getLayoutByShow(Long showId) {
        return repo.findByShowId(showId).stream().map(SeatMapper::toResponse).toList();
    }

    @Override
    public List<SeatResponse> getAvailableByShow(Long showId) {
        return repo.findByShowIdAndStatus(showId, "AVAILABLE").stream().map(SeatMapper::toResponse).toList();
    }

    @Override
    public List<SeatResponse> reserveSeats(Long showId, List<String> seatNumbers) {
        List<SeatResponse> reserved = new ArrayList<>();
        for (String seatNo : seatNumbers) {
            Seat s = repo.findByShowIdAndSeatNumber(showId, seatNo);
            if (s == null) throw new RuntimeException("Seat not found: " + seatNo);
            if (!"AVAILABLE".equals(s.getStatus())) {
                throw new RuntimeException("Seat " + seatNo + " is not available");
            }
            s.setStatus("RESERVED");
            reserved.add(SeatMapper.toResponse(repo.save(s)));
        }
        return reserved;
    }

    @Override
    public void releaseSeats(Long showId, List<String> seatNumbers) {
        for (String seatNo : seatNumbers) {
            Seat s = repo.findByShowIdAndSeatNumber(showId, seatNo);
            if (s != null) {
                s.setStatus("AVAILABLE");
                repo.save(s);
            }
        }
    }

    @Override
    public List<SeatResponse> bookSeats(Long showId, List<String> seatNumbers) {
        List<SeatResponse> booked = new ArrayList<>();
        for (String seatNo : seatNumbers) {
            Seat s = repo.findByShowIdAndSeatNumber(showId, seatNo);
            if (s == null) throw new RuntimeException("Seat not found: " + seatNo);
            s.setStatus("BOOKED");
            booked.add(SeatMapper.toResponse(repo.save(s)));
        }
        return booked;
    }

    @Override
    public String getSeatStatus(Long seatId) {
        return repo.findById(seatId)
            .orElseThrow(() -> new RuntimeException("Seat not found: " + seatId)).getStatus();
    }
}
