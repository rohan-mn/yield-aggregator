// src/main/java/com/example/controller/YieldController.java
package com.example.controller;

import com.example.dto.ProtocolDto;
import com.example.service.DefiLlamaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class YieldController {
    private final DefiLlamaService llama;

    /**
     * GET /api/protocols
     * - ?count=N (default 5) returns top-N by APY
     * - ?search=foo    returns all matching 'foo'
     */
    @GetMapping("/protocols")
    public List<ProtocolDto> protocols(
        @RequestParam(required = false) String search,
        @RequestParam(required = false, defaultValue = "5") int count
    ) {
        if (search != null && !search.isBlank()) {
            return llama.searchProtocols(search);
        } else {
            return llama.getTopProtocols(count);
        }
    }
}
