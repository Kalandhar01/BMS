package com.bookmyshow.booking.service.impl;

import com.bookmyshow.booking.client.ShowServiceClient;
import com.bookmyshow.booking.client.SeatServiceClient;
import com.bookmyshow.booking.dto.BookingRequest;
import com.bookmyshow.booking.dto.BookingResponse;
import com.bookmyshow.booking.dto.BookingMapper;
import com.bookmyshow.booking.entity.Booking;
import com.bookmyshow.booking.repository.BookingRepository;
import com.bookmyshow.booking.service.BookingService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository repo;
    private final ShowServiceClient showClient;
    private final SeatServiceClient seatClient;

    public BookingServiceImpl(BookingRepository r, ShowServiceClient sc, SeatServiceClient se) {
        this.repo = r;
        this.showClient = sc;
        this.seatClient = se;
    }

    @Override
    public BookingResponse create(BookingRequest req) {
        List<String> seatNumbers = req.resolveSeatNumbers();
        if (seatNumbers.isEmpty()) {
            throw new RuntimeException("No seats specified in booking request");
        }

        Map<String, Object> show = showClient.getShowById(req.getShowId());
        if (show == null || show.isEmpty()) {
            throw new RuntimeException("Show not found: " + req.getShowId());
        }

        double price = Double.parseDouble(show.get("price").toString());
        BigDecimal amount = req.getAmount() != null
            ? req.getAmount()
            : BigDecimal.valueOf(seatNumbers.size() * price);

        Booking b = new Booking();
        b.setBookingNumber("BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        b.setUserId(req.getUserId());
        b.setMovieId(req.getMovieId());
        b.setShowId(req.getShowId());
        b.setSeatIds(String.join(",", seatNumbers));
        b.setAmount(amount);
        b.setBookingTime(LocalDateTime.now());
        b.setBookingStatus("PENDING");
        b.setPaymentStatus("PENDING");

        Booking saved = repo.save(b);

        Map<String, Object> reserveBody = Map.of(
            "showId", req.getShowId(),
            "seatNumbers", seatNumbers
        );
        try {
            seatClient.reserveSeats(reserveBody);
        } catch (Exception e) {
            System.err.println("Seat reservation failed: " + e.getMessage());
        }

        return BookingMapper.toResponse(saved);
    }

    @Override
    public BookingResponse getById(Long id) {
        return BookingMapper.toResponse(repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found: " + id)));
    }

    @Override
    public List<BookingResponse> getAll() {
        return repo.findAll().stream().map(BookingMapper::toResponse).toList();
    }

    @Override
    public List<BookingResponse> getByUserId(Long userId) {
        return repo.findByUserIdOrderByBookingTimeDesc(userId).stream()
            .map(BookingMapper::toResponse).toList();
    }

    @Override
    public BookingResponse cancelBooking(Long id) {
        Booking b = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        b.setBookingStatus("CANCELLED");
        b.setPaymentStatus("REFUNDED");
        return BookingMapper.toResponse(repo.save(b));
    }

    @Override
    public BookingResponse confirmBooking(Long id) {
        Booking b = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        b.setBookingStatus("CONFIRMED");
        b.setPaymentStatus("PAID");
        BookingResponse response = BookingMapper.toResponse(repo.save(b));

        List<String> seatNumbers = List.of(b.getSeatIds().split(","));
        if (!seatNumbers.isEmpty()) {
            Map<String, Object> bookBody = Map.of(
                "showId", b.getShowId(),
                "seatNumbers", seatNumbers
            );
            try {
                seatClient.bookSeats(bookBody);
            } catch (Exception e) {
                System.err.println("Seat booking on confirm failed: " + e.getMessage());
            }
        }

        return response;
    }

    @Override
    public BigDecimal calculateAmount(Long showId, List<String> seatNumbers) {
        Map<String, Object> show = showClient.getShowById(showId);
        double price = Double.parseDouble(show.get("price").toString());
        return BigDecimal.valueOf(seatNumbers.size() * price);
    }
}
