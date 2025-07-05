// src/main/java/com/example/service/DefiLlamaService.java
package com.example.service;

import com.example.dto.PoolDto;
import com.example.dto.ProtocolDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DefiLlamaService {
    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    /** Hold the full list of pools fetched from DeFiLlama */
    private final AtomicReference<List<PoolDto>> poolRef = new AtomicReference<>(List.of());

    /** Fetch once on startup */
    @PostConstruct
    public void init() {
        refreshPools();
    }

    /** Refresh every 30 seconds */
    @Scheduled(fixedRate = 30_000)
    public void refreshPools() {
        try {
            String json = rest.getForObject("https://yields.llama.fi/pools", String.class);
            JsonNode root = mapper.readTree(json);
            JsonNode data = root.has("data") ? root.get("data") : root; 

            List<PoolDto> pools = mapper.readValue(
                data.toString(),
                new TypeReference<List<PoolDto>>() {}
            );

            poolRef.set(pools);
            log.info("✅ Refreshed {} pools from DeFiLlama", pools.size());
        } catch (Exception ex) {
            log.error("❌ Failed to fetch DeFiLlama pools", ex);
        }
    }

    /** Return the raw list (if you ever need it) */
    public List<PoolDto> getAllPools() {
        return poolRef.get();
    }

    /** Compute and return top-N by APY */
    public List<ProtocolDto> getTopProtocols(int count) {
        return poolRef.get().stream()
            .filter(p -> p.getProject() != null)
            .map(p -> new ProtocolDto(
                p.getProject(),
                (p.getApyBase() != null ? p.getApyBase() : 0.0)
                + (p.getApyReward() != null ? p.getApyReward() : 0.0)
            ))
            .sorted(Comparator.comparingDouble(ProtocolDto::getApy).reversed())
            .limit(count)
            .collect(Collectors.toList());
    }

    /** Search by project name (case-insensitive) */
    public List<ProtocolDto> searchProtocols(String term) {
        String lower = term.toLowerCase();
        return poolRef.get().stream()
            .filter(p -> p.getProject() != null
                      && p.getProject().toLowerCase().contains(lower))
            .map(p -> new ProtocolDto(
                p.getProject(),
                (p.getApyBase() != null ? p.getApyBase() : 0.0)
                + (p.getApyReward() != null ? p.getApyReward() : 0.0)
            ))
            .sorted(Comparator.comparingDouble(ProtocolDto::getApy).reversed())
            .collect(Collectors.toList());
    }
}
