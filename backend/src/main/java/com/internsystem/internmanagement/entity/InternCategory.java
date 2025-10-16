package com.internsystem.internmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "intern_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InternCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Integer categoryId;

    @Column(name = "category_name", nullable = false, unique = true)
    private String categoryName;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_intern_id", referencedColumnName = "intern_id")
    private Intern leadIntern;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private Set<Intern> interns;
}