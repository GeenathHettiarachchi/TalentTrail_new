package com.internsystem.internmanagement.dto;

public class ContributorStatDTO {
    private String username;
    private String displayName;
    private int commitCount;

    public ContributorStatDTO() {}

    public ContributorStatDTO(String username, String displayName, int commitCount) {
        this.username = username;
        this.displayName = displayName;
        this.commitCount = commitCount;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public int getCommitCount() {
        return commitCount;
    }

    public void setCommitCount(int commitCount) {
        this.commitCount = commitCount;
    }
}
