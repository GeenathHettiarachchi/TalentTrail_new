package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.Intern;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List; // <-- This is the line that was missing.

public interface InternRepository extends JpaRepository<Intern, Long> {
    Optional<Intern> findByInternCode(String internCode);
    // This is the new method we are adding.
    // Spring Boot is smart enough to automatically create the database query
    // just from the name of the method. "findByTrainingEndDateBetween" tells it
    // exactly what to do.
    List<Intern> findByTrainingEndDateBetweenAndEndDateAlertSentFalse(LocalDate startDate, LocalDate endDate);

    List<Intern> findByCategory_CategoryId(Integer categoryId);
}
