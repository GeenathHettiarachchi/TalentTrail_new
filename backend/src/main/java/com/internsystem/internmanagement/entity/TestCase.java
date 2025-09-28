package com.internsystem.internmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long testCaseId;

    private String testCaseName;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String expectedOutput;

    private String actualOutput;

    @Enumerated(EnumType.STRING)
    private TestCaseStatus status;

    @ManyToOne
    @JoinColumn(name = "function_id")
    private Function function;

    @ManyToOne
    @JoinColumn(name = "created_by_intern_id")
    private Intern createdByIntern;

    @ManyToOne
    @JoinColumn(name = "executed_by_intern_id")
    private Intern executedByIntern;

    private LocalDate executionDate;

    private Boolean isAutomated;

    private String remarks;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}