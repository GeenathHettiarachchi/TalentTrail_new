package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.InternDTO;
import com.internsystem.internmanagement.entity.Intern;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

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
        
        // NEW FIELDS mapping
        dto.setFieldOfSpecialization(intern.getFieldOfSpecialization());
        dto.setWorkingBranch(intern.getWorkingBranch());
        dto.setDegree(intern.getDegree());
        dto.setRole(intern.getRole());
        
        // Convert comma-separated strings to lists
        if (intern.getSkills() != null && !intern.getSkills().trim().isEmpty()) {
            List<String> skillsList = Arrays.stream(intern.getSkills().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            dto.setSkills(skillsList);
        }
        
        if (intern.getLanguagesAndFrameworks() != null && !intern.getLanguagesAndFrameworks().trim().isEmpty()) {
            List<String> languagesList = Arrays.stream(intern.getLanguagesAndFrameworks().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            dto.setLanguagesAndFrameworks(languagesList);
        }
        
        if (intern.getProjects() != null && !intern.getProjects().trim().isEmpty()) {
            List<String> projectsList = Arrays.stream(intern.getProjects().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            dto.setProjects(projectsList);
        }
        
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
        
        // NEW FIELDS mapping
        intern.setFieldOfSpecialization(dto.getFieldOfSpecialization());
        intern.setWorkingBranch(dto.getWorkingBranch());
        intern.setDegree(dto.getDegree());
        intern.setRole(dto.getRole());
        
        // Convert lists to comma-separated strings
        if (dto.getSkills() != null && !dto.getSkills().isEmpty()) {
            String skillsString = String.join(",", dto.getSkills());
            intern.setSkills(skillsString);
        }
        
        if (dto.getLanguagesAndFrameworks() != null && !dto.getLanguagesAndFrameworks().isEmpty()) {
            String languagesString = String.join(",", dto.getLanguagesAndFrameworks());
            intern.setLanguagesAndFrameworks(languagesString);
        }
        
        if (dto.getProjects() != null && !dto.getProjects().isEmpty()) {
            String projectsString = String.join(",", dto.getProjects());
            intern.setProjects(projectsString);
        }
        
        return intern;
    }
}