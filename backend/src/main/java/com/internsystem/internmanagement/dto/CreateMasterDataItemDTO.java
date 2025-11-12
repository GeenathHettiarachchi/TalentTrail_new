package com.internsystem.internmanagement.dto;

import lombok.Data;

// This is what we receive from the frontend when creating a new item
@Data
public class CreateMasterDataItemDTO {
    private String itemName;
}