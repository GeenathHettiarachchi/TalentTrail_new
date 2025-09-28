package com.internsystem.internmanagement.dto;

import java.time.OffsetDateTime;

public class SimpleCommitDTO {
    private String hash;
    private String message;
    private String author;
    private OffsetDateTime date;

    public SimpleCommitDTO() {}

    public SimpleCommitDTO(String hash, String message, String author, OffsetDateTime date) {
        this.hash = hash;
        this.message = message;
        this.author = author;
        this.date = date;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public OffsetDateTime getDate() {
        return date;
    }

    public void setDate(OffsetDateTime date) {
        this.date = date;
    }
}
