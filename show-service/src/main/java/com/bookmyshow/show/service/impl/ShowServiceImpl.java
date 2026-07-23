package com.bookmyshow.show.service.impl;

import com.bookmyshow.show.dto.ShowRequest;
import com.bookmyshow.show.dto.ShowResponse;
import com.bookmyshow.show.dto.ShowMapper;
import com.bookmyshow.show.entity.Show;
import com.bookmyshow.show.repository.ShowRepository;
import com.bookmyshow.show.service.ShowService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ShowServiceImpl implements ShowService {

    private final ShowRepository repo;

    public ShowServiceImpl(ShowRepository r) { this.repo = r; }

    @Override
    public ShowResponse create(ShowRequest req) {
        return ShowMapper.toResponse(repo.save(ShowMapper.toEntity(req)));
    }

    @Override
    public ShowResponse getById(Long id) {
        return ShowMapper.toResponse(repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Show not found: " + id)));
    }

    @Override
    public List<ShowResponse> getAll() {
        return repo.findAll().stream().map(ShowMapper::toResponse).toList();
    }

    @Override
    public List<ShowResponse> getByMovie(Long movieId) {
        return repo.findByMovieId(movieId).stream().map(ShowMapper::toResponse).toList();
    }

    @Override
    public List<ShowResponse> getByDate(LocalDate date) {
        return repo.findByShowDate(date).stream().map(ShowMapper::toResponse).toList();
    }

    @Override
    public List<ShowResponse> getByTheatre(Long theatreId) {
        return repo.findByScreenId(theatreId).stream().map(ShowMapper::toResponse).toList();
    }

    @Override
    public List<ShowResponse> search(Long movieId, LocalDate date, Long screenId) {
        if (movieId != null) return getByMovie(movieId);
        if (date != null) return getByDate(date);
        if (screenId != null) return getByTheatre(screenId);
        return getAll();
    }
}
