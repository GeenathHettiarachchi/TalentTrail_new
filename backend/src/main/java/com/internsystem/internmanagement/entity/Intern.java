package com.internsystem.internmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "interns")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Intern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "intern_id")
    private Long internId;

    @Column(unique = true)
    private String internCode;

    @Column(nullable = false)
    private String name;

    // --- ADD THE NEW FIELD FOR THE ALERT FLAG ---
    @Column(name = "end_date_alert_sent") // This will create a new column in your database
    private Boolean endDateAlertSent = false; // <-- ADD THIS. It defaults to false.

    private String email;
    private LocalDate trainingStartDate;
    private LocalDate trainingEndDate;
    private String institute;

    @Column(name = "specialization")
    private String specialization;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "intern_skills", joinColumns = @JoinColumn(name = "intern_id"))
    @Column(name = "skill_name")
    private List<String> skills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "intern_projects", joinColumns = @JoinColumn(name = "intern_id"))
    @Column(name = "project_name")
    private List<String> projects = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private InternCategory category;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

