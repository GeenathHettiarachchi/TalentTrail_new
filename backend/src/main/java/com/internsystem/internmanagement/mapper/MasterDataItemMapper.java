package com.internsystem.internmanagement.mapper;

import com.internsystem.internmanagement.dto.MasterDataItemDTO;
import com.internsystem.internmanagement.entity.MasterDataItem;
import org.springframework.stereotype.Component;

@Component
public class MasterDataItemMapper {

    public MasterDataItemDTO toDTO(MasterDataItem item) {
        if (item == null) {
            return null;
        }

        return new MasterDataItemDTO(
            item.getId(),
            item.getItemName(),
            item.getCategory().name(),
            item.isActive()
        );
    }
}