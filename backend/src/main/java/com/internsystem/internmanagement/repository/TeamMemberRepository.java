package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    boolean existsByTeamTeamIdAndInternInternId(Long teamId, Long internId);
    List<TeamMember> findByTeamTeamId(Long teamId);
    List<TeamMember> findByInternInternId(Long internId);
    
    @Transactional
    void deleteByTeamTeamIdAndInternInternId(Long teamId, Long internId);
    
    @Transactional
    void deleteByTeamTeamId(Long teamId);
}