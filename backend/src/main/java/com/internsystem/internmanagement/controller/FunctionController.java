package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.FunctionDTO;
import com.internsystem.internmanagement.service.FunctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/functions")
@CrossOrigin(origins = "*")
public class FunctionController {

    @Autowired
    private FunctionService functionService;

    @GetMapping
    public List<FunctionDTO> getAll() {
        return functionService.getAllFunctions();
    }

    @GetMapping("/module/{moduleId}")
    public List<FunctionDTO> getByModuleId(@PathVariable Long moduleId) {
        return functionService.getFunctionsByModuleId(moduleId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FunctionDTO> getById(@PathVariable Long id) {
        return functionService.getFunctionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public FunctionDTO create(@RequestBody FunctionDTO dto) {
        return functionService.createFunction(dto);
    }

    @PutMapping("/{id}")
    public FunctionDTO update(@PathVariable Long id, @RequestBody FunctionDTO dto) {
        return functionService.updateFunction(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        functionService.deleteFunction(id);
    }
}