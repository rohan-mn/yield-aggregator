// src/main/java/com/example/service/DefiLlamaService.java
package com.example.service;

import com.example.dto.PoolDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class DefiLlamaService {
    private static final String LLAMA_URL = "https://yields.llama.fi/pools";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Getter private final AtomicReference<Double> apyAave = new AtomicReference<>(0.0);
    @Getter private final AtomicReference<Double> apyRaydium = new AtomicReference<>(0.0);

    @PostConstruct
    public void init() {
        fetchAndUpdate();
    }

    @Scheduled(fixedRate = 60_000)
    public void fetchAndUpdate() {
        try {
            String json = restTemplate.getForObject(LLAMA_URL, String.class);
            JsonNode root = objectMapper.readTree(json);
            JsonNode arr = root.isArray() ? root : root.path("data");

            List<PoolDto> pools = objectMapper.convertValue(
                arr,
                new TypeReference<List<PoolDto>>() {}
            );

            // Fetch Aave-V3 APY
            double aave = pools.stream()
                .filter(p -> p.getProject() != null 
                          && p.getProject().equalsIgnoreCase("aave-v3"))
                .mapToDouble(p -> (p.getApyBase() != null ? p.getApyBase() : 0.0)
                               + (p.getApyReward() != null ? p.getApyReward() : 0.0))
                .findFirst().orElse(0.0);

            // Fetch Raydium APY
            double binance_staked_eth = pools.stream()
                .filter(p -> p.getProject() != null 
                          && p.getProject().equalsIgnoreCase("binance-staked-eth"))
                .mapToDouble(p -> (p.getApyBase() != null ? p.getApyBase() : 0.0)
                               + (p.getApyReward() != null ? p.getApyReward() : 0.0))
                .findFirst().orElse(0.0);

            apyAave.set(aave);
            apyRaydium.set(binance_staked_eth);
            System.out.println("▶️ Aave APY=" + aave + ", Binance staked ETH  APY=" + binance_staked_eth);
        } catch (Exception ex) {
            System.err.println("❌ Error fetching DefiLlama pools: " + ex.getMessage());
        }
    }
}
