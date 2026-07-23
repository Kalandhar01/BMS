package com.bookmyshow.booking.dto;

import com.bookmyshow.booking.entity.Booking;

public class BookingMapper {

    public static BookingResponse toResponse(Booking b) {
        if (b == null) return null;
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setBookingNumber(b.getBookingNumber());
        r.setUserId(b.getUserId());
        r.setMovieId(b.getMovieId());
        r.setShowId(b.getShowId());
        r.setSeatIds(b.getSeatIds());
        r.setAmount(b.getAmount());
        r.setBookingTime(b.getBookingTime());
        r.setPaymentStatus(b.getPaymentStatus());
        r.setBookingStatus(b.getBookingStatus());
        return r;
    }
}
