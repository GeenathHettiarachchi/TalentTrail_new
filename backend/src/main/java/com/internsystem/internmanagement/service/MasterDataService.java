package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.dto.CreateMasterDataItemDTO;
import com.internsystem.internmanagement.dto.MasterDataItemDTO;
import com.internsystem.internmanagement.entity.MasterDataCategory;
import com.internsystem.internmanagement.entity.MasterDataItem;
import com.internsystem.internmanagement.exception.ExistingResourceException;
import com.internsystem.internmanagement.exception.ResourceNotFoundException;
import com.internsystem.internmanagement.mapper.MasterDataItemMapper;
import com.internsystem.internmanagement.repository.MasterDataItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MasterDataService {

    private final MasterDataItemRepository repository;
    private final MasterDataItemMapper mapper;

    private String formatItemName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        String trimmed = name.trim();
        String lowercased = trimmed.toLowerCase();
        
        // Capitalize the first letter and add the rest
        return Character.toUpperCase(lowercased.charAt(0)) + lowercased.substring(1);
    }

    /**
     * Gets all *active* items for a category (for form dropdowns)
     */
    public List<MasterDataItemDTO> getActiveItemsByCategory(MasterDataCategory category) {
        return repository.findByCategoryAndIsActiveTrue(category)
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Gets *all* items for a category (for the management modal)
     */
    public List<MasterDataItemDTO> getAllItemsByCategory(MasterDataCategory category) {
        return repository.findByCategory(category)
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new master data item for a specific category
     */
    public MasterDataItemDTO createItem(MasterDataCategory category, CreateMasterDataItemDTO dto) {
        String formattedName = formatItemName(dto.getItemName());
        // Check for duplicates
        repository.findByItemNameAndCategory(formattedName, category).ifPresent(item -> {
            throw new ExistingResourceException("Item '" + formattedName + "' already exists in this category.");
        });

        MasterDataItem newItem = new MasterDataItem();
        newItem.setItemName(formattedName);
        newItem.setCategory(category);
        newItem.setActive(true); // Active by default
        
        return mapper.toDTO(repository.save(newItem));
    }

    /**
     * Updates an item's name
     */
    public MasterDataItemDTO updateItem(Long id, String newItemName) {
        MasterDataItem item = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        String formattedName = formatItemName(newItemName);

        // Check if new name causes a duplicate
        if (!item.getItemName().equalsIgnoreCase(formattedName) && 
            repository.findByItemNameAndCategory(formattedName, item.getCategory()).isPresent()) {
            throw new ExistingResourceException("Item '" + formattedName + "' already exists in this category.");
        }

        item.setItemName(formattedName);
        return mapper.toDTO(repository.save(item));
    }

    /**
     * Deletes (archives) an item. We use "soft delete" to protect data.
     */
    public void deleteItem(Long id) {
        MasterDataItem item = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        // We don't delete it. We archive it to protect existing interns.
        item.setActive(false);
        repository.save(item);
    }

    /**
     * Reactivates (un-archives) a soft-deleted item.
     */
    public MasterDataItemDTO reactivateItem(Long id) {
        MasterDataItem item = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        // Set it back to active
        item.setActive(true);
        return mapper.toDTO(repository.save(item));
    }
}