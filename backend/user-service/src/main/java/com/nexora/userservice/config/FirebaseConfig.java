package com.nexora.userservice.config;

import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        System.out.println("Firebase Config loaded (service account key will be added later)");
    }
}
