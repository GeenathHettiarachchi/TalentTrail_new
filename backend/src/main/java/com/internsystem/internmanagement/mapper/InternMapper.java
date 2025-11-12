package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.InternDTO;
import com.internsystem.internmanagement.entity.Intern;
import org.springframework.stereotype.Component;

@Component
public class InternMapper {
    public InternDTO toDTO(Intern intern) {
        InternDTO dto = new InternDTO();
        dto.setInternId(intern.getInternId());
        dto.setInternCode(intern.getInternCode());
        dto.setName(intern.getName());
        dto.setEmail(intern.getEmail());
        dto.setInstitute(intern.getInstitute());
        dto.setTrainingStartDate(intern.getTrainingStartDate());
        dto.setTrainingEndDate(intern.getTrainingEndDate());
        return dto;
    }

    public Intern toEntity(InternDTO dto) {
        Intern intern = new Intern();
        intern.setInternId(dto.getInternId());
        intern.setInternCode(dto.getInternCode());
        intern.setName(dto.getName());
        intern.setEmail(dto.getEmail());
        intern.setInstitute(dto.getInstitute());
        intern.setTrainingStartDate(dto.getTrainingStartDate());
        intern.setTrainingEndDate(dto.getTrainingEndDate());
        return intern;
    }
}
