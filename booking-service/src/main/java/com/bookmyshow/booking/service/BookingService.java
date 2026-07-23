package com.bookmyshow.booking.service;

import com.bookmyshow.booking.dto.BookingRequest;
import com.bookmyshow.booking.dto.BookingResponse;
import java.math.BigDecimal;
import java.util.List;

public interface BookingService {
    BookingResponse create(BookingRequest req);
    BookingResponse getById(Long id);
    List<BookingResponse> getAll();
    List<BookingResponse> getByUserId(Long userId);
    BookingResponse cancelBooking(Long id);
    BookingResponse confirmBooking(Long id);
    BigDecimal calculateAmount(Long showId, List<String> seatNumbers);
}
