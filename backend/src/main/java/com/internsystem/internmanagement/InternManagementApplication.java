package com.internsystem.internmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class InternManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(InternManagementApplication.class, args);
    }
}
