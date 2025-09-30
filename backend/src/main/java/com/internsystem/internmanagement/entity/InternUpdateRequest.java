package com.internsystem.internmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "intern_update_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InternUpdateRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who is being updated
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intern_id", nullable = false)
    private Intern intern;

    // Who requested the change (AuthUser id)
    @Column(name = "requested_by_user_id", nullable = false)
    private Long requestedByUserId;

    // Optional: who reviewed (AuthUser id)
    @Column(name = "reviewed_by_user_id")
    private Long reviewedByUserId;

    // Proposed values
    private String name;
    private String email;
    private String institute;
    private LocalDate trainingStartDate;
    private LocalDate trainingEndDate;

    // Status + reason
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Column(length = 1000)
    private String rejectionReason;

    @CreationTimestamp
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
