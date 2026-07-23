package com.bookmyshow.show.dto;

public class ShowRequest {
    private Long movieId;
    private Long screenId;
    private String showDate;
    private String startTime;
    private String endTime;
    private double price;

    public ShowRequest() {}

    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }
    public Long getScreenId() { return screenId; }
    public void setScreenId(Long screenId) { this.screenId = screenId; }
    public String getShowDate() { return showDate; }
    public void setShowDate(String showDate) { this.showDate = showDate; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}
