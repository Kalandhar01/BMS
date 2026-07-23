package com.bookmyshow.seat.dto;

public class SeatResponse {
    private Long id;
    private Long showId;
    private String seatNumber;
    private String seatType;
    private double price;
    private String status;

    public SeatResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getShowId() { return showId; }
    public void setShowId(Long showId) { this.showId = showId; }
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
    public String getSeatType() { return seatType; }
    public void setSeatType(String seatType) { this.seatType = seatType; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
