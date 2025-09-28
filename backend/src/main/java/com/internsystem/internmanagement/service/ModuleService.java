package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.dto.ModuleDTO;
import com.internsystem.internmanagement.entity.Module;
import com.internsystem.internmanagement.entity.Project;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.mapper.ModuleMapper;
import com.internsystem.internmanagement.repository.ModuleRepository;
import com.internsystem.internmanagement.repository.ProjectRepository;
import com.internsystem.internmanagement.repository.InternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ModuleService {

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private InternRepository internRepository;

    public List<ModuleDTO> getAllModules() {
        return moduleRepository.findAll()
                .stream()
                .map(ModuleMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ModuleDTO> getModulesByProjectId(Long projectId) {
        return moduleRepository.findByProjectProjectId(projectId)
                .stream()
                .map(ModuleMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ModuleDTO createModule(ModuleDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Intern ownerIntern = null;
        if (dto.getOwnerInternId() != null) {
            ownerIntern = internRepository.findById(dto.getOwnerInternId())
                    .orElseThrow(() -> new RuntimeException("Owner Intern not found"));
        }
        Module module = ModuleMapper.toEntity(dto, project, ownerIntern);
        Module saved = moduleRepository.save(module);
        return ModuleMapper.toDTO(saved);
    }

    public Optional<ModuleDTO> getModuleById(Long id) {
        return moduleRepository.findById(id).map(ModuleMapper::toDTO);
    }

    public ModuleDTO updateModule(Long id, ModuleDTO dto) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Intern ownerIntern = null;
        if (dto.getOwnerInternId() != null) {
            ownerIntern = internRepository.findById(dto.getOwnerInternId())
                    .orElseThrow(() -> new RuntimeException("Owner Intern not found"));
        }
        module.setModuleName(dto.getModuleName());
        module.setDescription(dto.getDescription());
        module.setProject(project);
        module.setOwnerIntern(ownerIntern);
        module.setStatus(dto.getStatus());
        Module saved = moduleRepository.save(module);
        return ModuleMapper.toDTO(saved);
    }

    public void deleteModule(Long id) {
        moduleRepository.deleteById(id);
    }
}