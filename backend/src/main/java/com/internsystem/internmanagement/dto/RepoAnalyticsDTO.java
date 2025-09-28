package com.internsystem.internmanagement.dto;

import java.util.List;

public class RepoAnalyticsDTO {
    private List<ContributorStatDTO> contributors;
    private List<SimpleCommitDTO> recentCommits;

    public RepoAnalyticsDTO() {}

    public RepoAnalyticsDTO(List<ContributorStatDTO> contributors, List<SimpleCommitDTO> recentCommits) {
        this.contributors = contributors;
        this.recentCommits = recentCommits;
    }

    public List<ContributorStatDTO> getContributors() {
        return contributors;
    }

    public void setContributors(List<ContributorStatDTO> contributors) {
        this.contributors = contributors;
    }

    public List<SimpleCommitDTO> getRecentCommits() {
        return recentCommits;
    }

    public void setRecentCommits(List<SimpleCommitDTO> recentCommits) {
        this.recentCommits = recentCommits;
    }
}
