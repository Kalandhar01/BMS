package com.bookmyshow.booking.dto;

import java.util.List;

public class CalculateRequest {
    private Long showId;
    private List<String> seatNumbers;

    public CalculateRequest() {}

    public Long getShowId() { return showId; }
    public void setShowId(Long showId) { this.showId = showId; }
    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
}
