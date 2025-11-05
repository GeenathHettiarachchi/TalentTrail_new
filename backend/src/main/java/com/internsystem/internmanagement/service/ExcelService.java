package com.internsystem.internmanagement.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class ExcelService {

    // Path to your local Excel file
    private static final String EXCEL_FILE_PATH = "src/main/resources/data/DevOps Tasks & Projects.xlsx";

    public List<String> getResourceTypes() {
        Set<String> resourceTypesSet = new LinkedHashSet<>(); // Use Set to avoid duplicates

        try (FileInputStream fis = new FileInputStream(EXCEL_FILE_PATH);
                Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0); // First sheet

            // Skip the header row (row 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    Cell cell = row.getCell(3); // Column D (index 3) - Task column

                    if (cell != null) {
                        String value = "";

                        // Handle different cell types
                        switch (cell.getCellType()) {
                            case STRING:
                                value = cell.getStringCellValue().trim();
                                break;
                            case NUMERIC:
                                value = String.valueOf((int) cell.getNumericCellValue()).trim();
                                break;
                            default:
                                break;
                        }

                        // Add non-empty values to the set
                        if (!value.isEmpty() && !value.equalsIgnoreCase("Task")) {
                            resourceTypesSet.add(value);
                        }
                    }
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read Excel file: " + e.getMessage(), e);
        }

        // Convert Set to List and return
        return new ArrayList<>(resourceTypesSet);
    }
}