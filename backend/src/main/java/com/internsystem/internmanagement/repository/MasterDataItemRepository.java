package com.internsystem.internmanagement.repository;

import com.internsystem.internmanagement.entity.MasterDataCategory;
import com.internsystem.internmanagement.entity.MasterDataItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MasterDataItemRepository extends JpaRepository<MasterDataItem, Long> {

    List<MasterDataItem> findByCategoryAndIsActiveTrue(MasterDataCategory category);

    List<MasterDataItem> findByCategory(MasterDataCategory category);

    Optional<MasterDataItem> findByItemNameAndCategory(String itemName, MasterDataCategory category);
}