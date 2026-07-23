package com.bookmyshow.seat.dto;

import com.bookmyshow.seat.entity.Seat;

public class SeatMapper {

    public static SeatResponse toResponse(Seat s) {
        if (s == null) return null;
        SeatResponse r = new SeatResponse();
        r.setId(s.getId());
        r.setShowId(s.getShowId());
        r.setSeatNumber(s.getSeatNumber());
        r.setSeatType(s.getSeatType());
        r.setPrice(s.getPrice());
        r.setStatus(s.getStatus());
        return r;
    }

    public static Seat toEntity(SeatRequest req) {
        if (req == null) return null;
        Seat s = new Seat();
        s.setShowId(req.getShowId());
        s.setSeatNumber(req.getSeatNumber());
        s.setSeatType(req.getSeatType());
        s.setPrice(req.getPrice());
        s.setStatus("AVAILABLE");
        return s;
    }
}
