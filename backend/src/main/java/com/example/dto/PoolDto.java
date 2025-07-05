// src/main/java/com/example/dto/PoolDto.java
package com.example.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PoolDto {
    private String pool;
    private String chain;
    private String project;
    private String symbol;
    private double tvlUsd;

    @JsonProperty("apyBase")
    private Double apyBase;

    @JsonProperty("apyReward")
    private Double apyReward;
}