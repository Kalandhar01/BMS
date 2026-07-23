package com.bookmyshow.show.service;

import com.bookmyshow.show.dto.ShowRequest;
import com.bookmyshow.show.dto.ShowResponse;
import java.time.LocalDate;
import java.util.List;

public interface ShowService {
    ShowResponse create(ShowRequest req);
    ShowResponse getById(Long id);
    List<ShowResponse> getAll();
    List<ShowResponse> getByMovie(Long movieId);
    List<ShowResponse> getByDate(LocalDate date);
    List<ShowResponse> getByTheatre(Long theatreId);
    List<ShowResponse> search(Long movieId, LocalDate date, Long screenId);
}
