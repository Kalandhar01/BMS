package com.bookmyshow.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "show-service", url = "http://localhost:8084")
public interface ShowServiceClient {

    @GetMapping("/shows/{id}")
    Map<String, Object> getShowById(@PathVariable("id") Long id);
}
