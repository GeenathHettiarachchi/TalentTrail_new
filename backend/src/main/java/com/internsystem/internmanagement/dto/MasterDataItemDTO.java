package com.internsystem.internmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// This is what we send to the frontend
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MasterDataItemDTO {
    private Long id;
    private String itemName;
    private String category;
    private boolean isActive;
}