package com.internsystem.internmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "master_data_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MasterDataItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private MasterDataCategory category;

    // Active status of the master data item
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
