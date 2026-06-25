package com.lms.config;

import org.springframework.cloud.config.server.EnableConfigServer;
import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableDiscoveryClient
@EnableConfigServer // central config service
public class ConfigServerApplication {
    public static void main(String[] args) {
        // load properties native profile configuration
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
