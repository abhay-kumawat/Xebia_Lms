package com.lms.discovery;

import org.springframework.boot.SpringApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableEurekaServer // service registry lookup server
public class DiscoveryServerApplication {
    public static void main(String[] args) {
        // boot eureka
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}
