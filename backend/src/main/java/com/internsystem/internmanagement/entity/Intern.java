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
    @Column(name = "intern_id")
    private Long internId;

    @Column(unique = true)
    private String internCode;

    @Column(nullable = false)
    private String name;

     @Column(name = "training_end_date") // Make sure this matches your column name
    private LocalDate trainingEndDate;

    // --- ADD THE NEW FIELD FOR THE ALERT FLAG ---
    @Column(name = "end_date_alert_sent") // This will create a new column in your database
    private Boolean endDateAlertSent = false; // <-- ADD THIS. It defaults to false.

    private String email;
    private LocalDate trainingStartDate;
    private LocalDate trainingEnDate;
    private String institute;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private InternCategory category;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

