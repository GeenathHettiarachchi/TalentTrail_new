package com.internsystem.internmanagement.controller;

import com.internsystem.internmanagement.dto.CreateMasterDataItemDTO;
import com.internsystem.internmanagement.dto.MasterDataItemDTO;
import com.internsystem.internmanagement.entity.MasterDataCategory;
import com.internsystem.internmanagement.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/masterdata")
@RequiredArgsConstructor
public class MasterDataController {

    private final MasterDataService masterDataService;

    /**
     * Endpoint for your "Manage" modal.
     * Gets all items (active and inactive) for a category.
     */
    @GetMapping("/manage/{category}")
    public ResponseEntity<List<MasterDataItemDTO>> getAllItemsForCategory(
            @PathVariable("category") MasterDataCategory category) {
        return ResponseEntity.ok(masterDataService.getAllItemsByCategory(category));
    }

    /**
     * Endpoint for your form dropdowns.
     * Gets only *active* items for a category.
     */
    @GetMapping("/active/{category}")
    public ResponseEntity<List<String>> getActiveItemNamesForCategory(
            @PathVariable("category") MasterDataCategory category) {
        
        // Return a simple list of strings for the dropdowns
        List<String> itemNames = masterDataService.getActiveItemsByCategory(category)
                .stream()
                .map(MasterDataItemDTO::getItemName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(itemNames);
    }

    @PostMapping("/{category}")
    public ResponseEntity<MasterDataItemDTO> createItem(
            @PathVariable("category") MasterDataCategory category,
            @RequestBody CreateMasterDataItemDTO dto) {
        return ResponseEntity.ok(masterDataService.createItem(category, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MasterDataItemDTO> updateItem(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) { // Use Map for simple name update
        String newItemName = payload.get("itemName");
        return ResponseEntity.ok(masterDataService.updateItem(id, newItemName));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        masterDataService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<MasterDataItemDTO> reactivateItem(@PathVariable Long id) {
        MasterDataItemDTO updatedItem = masterDataService.reactivateItem(id);
        return ResponseEntity.ok(updatedItem);
    }
}