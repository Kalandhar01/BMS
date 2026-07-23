package com.bookmyshow.screen.service;

import com.bookmyshow.screen.dto.ScreenRequest;
import com.bookmyshow.screen.dto.ScreenResponse;
import java.util.List;

public interface ScreenService {
    ScreenResponse create(ScreenRequest req);
    ScreenResponse getById(Long id);
    List<ScreenResponse> getAll();
    List<ScreenResponse> getTheatres();
    List<String> getTheatreNames();
}
