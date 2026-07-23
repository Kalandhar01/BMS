package com.bookmyshow.show.dto;

import com.bookmyshow.show.entity.Show;
import java.time.LocalDate;
import java.time.LocalTime;

public class ShowMapper {

    public static ShowResponse toResponse(Show s) {
        if (s == null) return null;
        ShowResponse r = new ShowResponse();
        r.setId(s.getId());
        r.setMovieId(s.getMovieId());
        r.setScreenId(s.getScreenId());
        r.setShowDate(s.getShowDate());
        r.setStartTime(s.getStartTime());
        r.setEndTime(s.getEndTime());
        r.setPrice(s.getPrice());
        return r;
    }

    public static Show toEntity(ShowRequest req) {
        if (req == null) return null;
        Show s = new Show();
        s.setMovieId(req.getMovieId());
        s.setScreenId(req.getScreenId());
        s.setShowDate(req.getShowDate() != null ? LocalDate.parse(req.getShowDate()) : null);
        s.setStartTime(req.getStartTime() != null ? LocalTime.parse(req.getStartTime()) : null);
        s.setEndTime(req.getEndTime() != null ? LocalTime.parse(req.getEndTime()) : null);
        s.setPrice(req.getPrice());
        return s;
    }
}
