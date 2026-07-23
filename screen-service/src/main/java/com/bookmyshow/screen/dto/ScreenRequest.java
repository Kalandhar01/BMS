package com.bookmyshow.screen.dto;

public class ScreenRequest {
    private String name;
    private String theatreName;
    private String location;
    private int totalSeats;

    public ScreenRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTheatreName() { return theatreName; }
    public void setTheatreName(String theatreName) { this.theatreName = theatreName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }
}
