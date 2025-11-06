package com.internsystem.internmanagement.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qa")
@CrossOrigin(origins = "*")
public class QAController {

    @GetMapping
    public String getQAInfo() {
        return "QA information loaded successfully!";
    }
}
