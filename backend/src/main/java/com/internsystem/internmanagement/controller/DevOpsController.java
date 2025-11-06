package com.internsystem.internmanagement.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/devops")
@CrossOrigin(origins = "*")
public class DevOpsController {

    @GetMapping
    public String getDevOpsInfo() {
        return "DevOps information loaded successfully!";
    }
}
