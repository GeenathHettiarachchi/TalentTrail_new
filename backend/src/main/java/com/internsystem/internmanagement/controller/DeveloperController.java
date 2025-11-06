package com.internsystem.internmanagement.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/developer")
@CrossOrigin(origins = "*")  // allows frontend to connect
public class DeveloperController {

    @GetMapping
    public String getDeveloperInfo() {
        return "Developer information loaded successfully!";
    }
}
