package com.bookmyshow.screen.dto;

import com.bookmyshow.screen.entity.Screen;

public class ScreenMapper {

    public static ScreenResponse toResponse(Screen s) {
        if (s == null) return null;
        ScreenResponse r = new ScreenResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setTheatreName(s.getTheatreName());
        r.setLocation(s.getLocation());
        r.setTotalSeats(s.getTotalSeats());
        return r;
    }

    public static Screen toEntity(ScreenRequest req) {
        if (req == null) return null;
        Screen s = new Screen();
        s.setName(req.getName());
        s.setTheatreName(req.getTheatreName());
        s.setLocation(req.getLocation());
        s.setTotalSeats(req.getTotalSeats());
        return s;
    }
}
