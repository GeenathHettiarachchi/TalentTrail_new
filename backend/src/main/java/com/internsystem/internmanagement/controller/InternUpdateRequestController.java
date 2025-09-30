package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.InternUpdateRequestDTO;
import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.InternUpdateRequest;
import com.internsystem.internmanagement.mapper.InternUpdateRequestMapper;
import com.internsystem.internmanagement.service.AuthenticationService;
import com.internsystem.internmanagement.service.InternUpdateRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/intern-update-requests")
@CrossOrigin(origins = "*")
public class InternUpdateRequestController {

    @Autowired
    private InternUpdateRequestService service;

    @Autowired
    private InternUpdateRequestMapper mapper;

    @Autowired
    private AuthenticationService auth;

    // Intern (or Admin) creates a request for a specific intern
    @PostMapping("/interns/{internId}")
    public ResponseEntity<InternUpdateRequestDTO> createRequest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long internId,
            @RequestBody InternUpdateRequestDTO dto) {

        Long requesterId = auth.getCurrentUser(authHeader)
                .map(AuthUser::getId)
                .orElse(null);

        InternUpdateRequest created = service.createRequest(
                internId, mapper.toEntity(dto, null), requesterId);
        return ResponseEntity.ok(mapper.toDTO(created));
    }

    // Admin → list all pending
    @GetMapping("/pending")
    public List<InternUpdateRequestDTO> listPending() {
        return service.listAllPending().stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    // Intern/Admin → list by intern
    @GetMapping("/interns/{internId}")
    public List<InternUpdateRequestDTO> listForIntern(@PathVariable Long internId) {
        return service.listForIntern(internId).stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    // Intern → list by requester (their own submissions)
    @GetMapping("/my")
    public List<InternUpdateRequestDTO> listMine(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long requesterId = auth.getCurrentUser(authHeader)
                .map(AuthUser::getId)
                .orElse(null);
        return service.listForRequester(requesterId).stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    // Admin approves
    @PutMapping("/{requestId}/approve")
    public InternUpdateRequestDTO approve(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long requestId) {

        Long reviewerId = auth.getCurrentUser(authHeader).map(AuthUser::getId).orElse(null);
        return mapper.toDTO(service.approve(requestId, reviewerId));
    }

    // Admin rejects
    @PutMapping("/{requestId}/reject")
    public InternUpdateRequestDTO reject(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long requestId,
            @RequestBody(required = false) String reason) {

        Long reviewerId = auth.getCurrentUser(authHeader).map(AuthUser::getId).orElse(null);
        return mapper.toDTO(service.reject(requestId, reviewerId, reason));
    }
}
