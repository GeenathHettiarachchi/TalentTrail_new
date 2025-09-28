package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.Intern;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InternRepository extends JpaRepository<Intern, Long> {
    Optional<Intern> findByInternCode(String internCode);
}
