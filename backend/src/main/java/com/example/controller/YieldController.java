// src/main/java/com/example/controller/YieldController.java
package com.example.controller;

import com.example.service.DefiLlamaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class YieldController {
    private final DefiLlamaService llama;

    /**
     * GET /api/apy -> { "A": <Aave%>, "B": <Raydium%> }
     */
    @GetMapping("/apy")
    public Map<String, Double> getApy() {
        double a = llama.getApyAave().get() * 100;
        double b = llama.getApyRaydium().get() * 100;
        return Map.of("Aave-V3", a, "Binance Staked ETH", b);
    }
}
