package com.internsystem.internmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "interns")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Intern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long internId;

    @Column(unique = true)
    private String internCode;

    @Column(nullable = false)
    private String name;

    private String email;
    private LocalDate trainingStartDate;
    private LocalDate trainingEndDate;
    private String institute;

    // NEW FIELDS
    @Column(name = "field_of_specialization")
    private String fieldOfSpecialization;
    
    @Column(name = "skills", length = 1000)
    private String skills;
    
    @Column(name = "working_branch")
    private String workingBranch;
    
    private String degree;
    
    private String role;
    
    @Column(name = "languages_frameworks", length = 1000)
    private String languagesAndFrameworks;
    
    @Column(name = "projects", length = 1000)
    private String projects;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}