package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.InternUpdateRequestDTO;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.entity.InternUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class InternUpdateRequestMapper {

    public InternUpdateRequestDTO toDTO(InternUpdateRequest r) {
        InternUpdateRequestDTO dto = new InternUpdateRequestDTO();
        dto.setId(r.getId());
        dto.setInternId(r.getIntern().getInternId());
        dto.setRequestedByUserId(r.getRequestedByUserId());
        dto.setReviewedByUserId(r.getReviewedByUserId());
        dto.setName(r.getName());
        dto.setEmail(r.getEmail());
        dto.setInstitute(r.getInstitute());
        dto.setTrainingStartDate(r.getTrainingStartDate());
        dto.setTrainingEndDate(r.getTrainingEndDate());
        dto.setStatus(r.getStatus());
        dto.setRejectionReason(r.getRejectionReason());
        dto.setSubmittedAt(r.getSubmittedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }

    public InternUpdateRequest toEntity(InternUpdateRequestDTO dto, Intern intern) {
        InternUpdateRequest r = new InternUpdateRequest();
        r.setId(dto.getId());
        r.setIntern(intern);
        r.setRequestedByUserId(dto.getRequestedByUserId());
        r.setReviewedByUserId(dto.getReviewedByUserId());
        r.setName(dto.getName());
        r.setEmail(dto.getEmail());
        r.setInstitute(dto.getInstitute());
        r.setTrainingStartDate(dto.getTrainingStartDate());
        r.setTrainingEndDate(dto.getTrainingEndDate());
        r.setStatus(dto.getStatus());
        r.setRejectionReason(dto.getRejectionReason());
        return r;
    }
}
