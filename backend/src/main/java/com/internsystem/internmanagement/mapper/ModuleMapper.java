package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.ModuleDTO;
import com.internsystem.internmanagement.entity.Module;
import com.internsystem.internmanagement.entity.Project;
import com.internsystem.internmanagement.entity.Intern;

public class ModuleMapper {

    public static ModuleDTO toDTO(Module module) {
        ModuleDTO dto = new ModuleDTO();
        dto.setModuleId(module.getModuleId());
        dto.setModuleName(module.getModuleName());
        dto.setDescription(module.getDescription());
        if (module.getProject() != null) {
            dto.setProjectId(module.getProject().getProjectId());
            dto.setProjectName(module.getProject().getProjectName());
        }
        if (module.getOwnerIntern() != null) {
            dto.setOwnerInternId(module.getOwnerIntern().getInternId());
            dto.setOwnerInternName(module.getOwnerIntern().getName());
        }
        dto.setStatus(module.getStatus());
        return dto;
    }

    public static Module toEntity(ModuleDTO dto, Project project, Intern ownerIntern) {
        Module module = new Module();
        module.setModuleId(dto.getModuleId());
        module.setModuleName(dto.getModuleName());
        module.setDescription(dto.getDescription());
        module.setProject(project);
        module.setOwnerIntern(ownerIntern);
        module.setStatus(dto.getStatus());
        return module;
    }
}