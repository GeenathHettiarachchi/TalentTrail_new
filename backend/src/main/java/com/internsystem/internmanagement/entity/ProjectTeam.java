package com.internsystem.internmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_teams", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "team_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
}
