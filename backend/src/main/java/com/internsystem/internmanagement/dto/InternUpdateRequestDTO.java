package com.internsystem.internmanagement.dto;

import com.internsystem.internmanagement.entity.ApprovalStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class InternUpdateRequestDTO {
    private Long id;
    private Long internId;
    private Long requestedByUserId;
    private Long reviewedByUserId;

    private String name;
    private String email;
    private String institute;
    private LocalDate trainingStartDate;
    private LocalDate trainingEndDate;

    private ApprovalStatus status;
    private String rejectionReason;

    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
}
