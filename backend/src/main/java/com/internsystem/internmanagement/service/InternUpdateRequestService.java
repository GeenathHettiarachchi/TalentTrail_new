package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.entity.*;
import com.internsystem.internmanagement.exception.ResourceNotFoundException;
import com.internsystem.internmanagement.repository.InternRepository;
import com.internsystem.internmanagement.repository.InternUpdateRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InternUpdateRequestService {

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private InternUpdateRequestRepository requestRepository;

    /**
     * Create a new update request (by intern or admin acting on behalf).
     */
    public InternUpdateRequest createRequest(Long internId, InternUpdateRequest proposed, Long requestedByUserId) {
        Intern intern = internRepository.findById(internId)
            .orElseThrow(() -> new ResourceNotFoundException("Intern not found with ID: " + internId));
        proposed.setIntern(intern);
        proposed.setRequestedByUserId(requestedByUserId);
        proposed.setStatus(ApprovalStatus.PENDING);
        proposed.setReviewedByUserId(null);
        proposed.setRejectionReason(null);
        return requestRepository.save(proposed);
    }

    public List<InternUpdateRequest> listAllPending() {
        return requestRepository.findByStatus(ApprovalStatus.PENDING);
    }

    public List<InternUpdateRequest> listForIntern(Long internId) {
        return requestRepository.findByIntern_InternId(internId);
    }

    public List<InternUpdateRequest> listForRequester(Long requesterUserId) {
        return requestRepository.findByRequestedByUserId(requesterUserId);
    }

    /**
     * Approve a request: apply changes to Intern, mark as APPROVED.
     */
    public InternUpdateRequest approve(Long requestId, Long reviewerUserId) {
        InternUpdateRequest r = requestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + requestId));

        if (r.getStatus() != ApprovalStatus.PENDING) {
            return r; // idempotent
        }

        Intern intern = r.getIntern();
        if (r.getName() != null) intern.setName(r.getName());
        if (r.getEmail() != null) intern.setEmail(r.getEmail());
        if (r.getInstitute() != null) intern.setInstitute(r.getInstitute());
        if (r.getTrainingStartDate() != null) intern.setTrainingStartDate(r.getTrainingStartDate());
        if (r.getTrainingEndDate() != null) intern.setTrainingEndDate(r.getTrainingEndDate());
        // Persist intern via repository save (JPA will be invoked by InternService or here if autowired)
        internRepository.save(intern);

        r.setStatus(ApprovalStatus.APPROVED);
        r.setReviewedByUserId(reviewerUserId);
        r.setRejectionReason(null);
        return requestRepository.save(r);
    }

    /**
     * Reject a request with a reason.
     */
    public InternUpdateRequest reject(Long requestId, Long reviewerUserId, String reason) {
        InternUpdateRequest r = requestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + requestId));
        if (r.getStatus() != ApprovalStatus.PENDING) {
            return r;
        }
        r.setStatus(ApprovalStatus.REJECTED);
        r.setReviewedByUserId(reviewerUserId);
        r.setRejectionReason(reason);
        return requestRepository.save(r);
    }
}
