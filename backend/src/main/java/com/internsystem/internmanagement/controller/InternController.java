package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.InternDTO;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.mapper.InternMapper;
import com.internsystem.internmanagement.service.InternService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interns")
@CrossOrigin(origins = "*")
public class InternController {

    @Autowired
    private InternService internService;

    @Autowired
    private InternMapper internMapper;

    @GetMapping
    public List<InternDTO> getAll() {
        return internService.getAllInterns()
                .stream()
                .map(internMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public InternDTO create(@RequestBody InternDTO internDTO) {
        Intern intern = internMapper.toEntity(internDTO);
        Intern saved = internService.createIntern(intern);
        return internMapper.toDTO(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternDTO> getById(@PathVariable Long id) {
        return internService.getInternById(id)
                .map(intern -> ResponseEntity.ok(internMapper.toDTO(intern)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<InternDTO> getByCode(@PathVariable String code) {
        return internService.getInternByCode(code)
                .map(intern -> ResponseEntity.ok(internMapper.toDTO(intern)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<InternDTO> update(@PathVariable Long id, @RequestBody InternDTO internDTO) {
        Intern intern = internMapper.toEntity(internDTO);
        Intern updated = internService.updateIntern(id, intern);
        return ResponseEntity.ok(internMapper.toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        internService.deleteIntern(id);
    }
}
