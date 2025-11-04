package com.internsystem.internmanagement.dto;

import lombok.Data;

@Data
public class InternCategoryDTO {
    private Integer categoryId;
    private String categoryName;
    private Long leadInternId;
}
