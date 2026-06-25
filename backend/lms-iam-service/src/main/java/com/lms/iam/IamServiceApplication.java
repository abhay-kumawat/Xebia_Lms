package com.lms.iam;

import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableDiscoveryClient // registries with eureka
public class IamServiceApplication {
    public static void main(String[] args) {
        // identity and access manager service entrypoint
        SpringApplication.run(IamServiceApplication.class, args);
    }
}
