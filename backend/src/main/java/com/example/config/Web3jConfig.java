package com.example.config;

import org.springframework.context.annotation.*;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Configuration
public class Web3jConfig {
    @Bean
    public Web3j web3j() {
        // Hardhat local RPC
        return Web3j.build(new HttpService("http://localhost:8545"));
    }
}
