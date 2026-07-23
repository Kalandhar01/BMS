package com.bookmyshow.booking.dto;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

public class BookingRequest {
    private Long userId;
    private Long movieId;
    private Long showId;
    private List<String> seatNumbers;
    private String seatIds;
    private BigDecimal amount;

    public BookingRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }
    public Long getShowId() { return showId; }
    public void setShowId(Long showId) { this.showId = showId; }
    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
    public String getSeatIds() { return seatIds; }
    public void setSeatIds(String seatIds) { this.seatIds = seatIds; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public List<String> resolveSeatNumbers() {
        if (seatNumbers != null && !seatNumbers.isEmpty()) return seatNumbers;
        if (seatIds != null && !seatIds.isEmpty()) return Arrays.asList(seatIds.split(","));
        return List.of();
    }
}
