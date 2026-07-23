package com.bookmyshow.screen.service.impl;

import com.bookmyshow.screen.dto.ScreenRequest;
import com.bookmyshow.screen.dto.ScreenResponse;
import com.bookmyshow.screen.dto.ScreenMapper;
import com.bookmyshow.screen.entity.Screen;
import com.bookmyshow.screen.repository.ScreenRepository;
import com.bookmyshow.screen.service.ScreenService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScreenServiceImpl implements ScreenService {

    private final ScreenRepository repo;

    public ScreenServiceImpl(ScreenRepository r) { this.repo = r; }

    @Override
    public ScreenResponse create(ScreenRequest req) {
        return ScreenMapper.toResponse(repo.save(ScreenMapper.toEntity(req)));
    }

    @Override
    public ScreenResponse getById(Long id) {
        return ScreenMapper.toResponse(repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Screen not found: " + id)));
    }

    @Override
    public List<ScreenResponse> getAll() {
        return repo.findAll().stream().map(ScreenMapper::toResponse).toList();
    }

    @Override
    public List<ScreenResponse> getTheatres() {
        return repo.findAll().stream().map(ScreenMapper::toResponse).toList();
    }

    @Override
    public List<String> getTheatreNames() {
        return repo.findDistinctTheatreNames();
    }
}
