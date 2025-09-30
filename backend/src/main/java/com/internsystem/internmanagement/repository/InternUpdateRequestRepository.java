package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.InternUpdateRequest;
import com.internsystem.internmanagement.entity.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InternUpdateRequestRepository extends JpaRepository<InternUpdateRequest, Long> {
    List<InternUpdateRequest> findByStatus(ApprovalStatus status);
    List<InternUpdateRequest> findByIntern_InternId(Long internId);
    List<InternUpdateRequest> findByRequestedByUserId(Long userId);
}
