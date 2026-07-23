package com.bookmyshow.seat.dto;

public class SeatRequest {
    private Long showId;
    private String seatNumber;
    private String seatType;
    private double price;

    public SeatRequest() {}

    public Long getShowId() { return showId; }
    public void setShowId(Long showId) { this.showId = showId; }
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
    public String getSeatType() { return seatType; }
    public void setSeatType(String seatType) { this.seatType = seatType; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}
