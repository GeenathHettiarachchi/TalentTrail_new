package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.ModuleDTO;
import com.internsystem.internmanagement.service.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = "*")
public class ModuleController {

    @Autowired
    private ModuleService moduleService;

    @GetMapping
    public List<ModuleDTO> getAll() {
        return moduleService.getAllModules();
    }

    @GetMapping("/project/{projectId}")
    public List<ModuleDTO> getByProjectId(@PathVariable Long projectId) {
        return moduleService.getModulesByProjectId(projectId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleDTO> getById(@PathVariable Long id) {
        return moduleService.getModuleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ModuleDTO create(@RequestBody ModuleDTO dto) {
        return moduleService.createModule(dto);
    }

    @PutMapping("/{id}")
    public ModuleDTO update(@PathVariable Long id, @RequestBody ModuleDTO dto) {
        return moduleService.updateModule(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        moduleService.deleteModule(id);
    }
}