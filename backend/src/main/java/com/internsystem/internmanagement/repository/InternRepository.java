package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InternRepository extends JpaRepository<Intern, Long> {
    Optional<Intern> findByInternCode(String internCode);
    
    // NEW: Query methods for FOS and Skills
    List<Intern> findByFieldOfSpecialization(String fieldOfSpecialization);
    
    @Query("SELECT i FROM Intern i WHERE i.skills LIKE %:skill%")
    List<Intern> findBySkillContaining(@Param("skill") String skill);
    
    List<Intern> findByWorkingBranch(String workingBranch);
    List<Intern> findByDegree(String degree);
}