// src/main/java/com/example/dto/ProtocolDto.java
package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Simple DTO for frontend use: protocol name + computed APY.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProtocolDto {
    private String name;
    private double apy;
}
