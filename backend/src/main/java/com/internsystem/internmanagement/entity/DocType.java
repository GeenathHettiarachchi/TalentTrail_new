package com.internsystem.internmanagement.entity;

public enum DocType {
    BRD("Business Requirement Document"),
    LLD("Low Level Diagram"),
    HLD("High Level Diagram"),
    DAD("Deployment Architecture Diagram");

    private final String displayName;

    DocType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
