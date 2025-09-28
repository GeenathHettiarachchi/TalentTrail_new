package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    @Autowired
    private ProjectRepository projectRepository;

    private volatile Integer activeInternsFromApi = 0;

    public void setActiveInternsFromApi(int count) {
        this.activeInternsFromApi = count;
    }

    public Integer getActiveInternsFromApi() {
        return activeInternsFromApi;
    }

    public Long getPendingRepositoryInfoCount() {
        // Count projects that are missing any of the three required repository fields
        return projectRepository.countProjectsMissingRepositoryInfo();
    }
}
