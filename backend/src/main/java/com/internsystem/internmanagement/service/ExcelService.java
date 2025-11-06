package com.internsystem.internmanagement.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelService {

    @Value("classpath:DevOps Master Data.xlsx")
    private Resource devopsMasterDataFile;

    @Value("classpath:QA Master Data.xlsx")
    private Resource qaMasterDataFile;

    @Value("classpath:WebDeveloper Master Data.xlsx")
    private Resource webDevMasterDataFile;

    // 2. Create separate lists to cache the data
    private List<String> devopsResourceTypes;
    private List<String> qaResourceTypes;
    private List<String> webDevResourceTypes;

    // 3. This method runs once when the server starts
    @PostConstruct
    public void loadAllMasterData() {
        // Load data from each file into its own list
        this.devopsResourceTypes = loadResourceTypesFromExcel(devopsMasterDataFile, "DevOps");
        this.qaResourceTypes = loadResourceTypesFromExcel(qaMasterDataFile, "QA");
        this.webDevResourceTypes = loadResourceTypesFromExcel(webDevMasterDataFile, "Web Developer");
    }

    // 4. These are the public methods our controller will use
    public List<String> getDevOpsResourceTypes() {
        return this.devopsResourceTypes;
    }

    public List<String> getQAResourceTypes() {
        return this.qaResourceTypes;
    }

    public List<String> getWebDevResourceTypes() {
        return this.webDevResourceTypes;
    }

    // 5. This is our reusable helper method
    private List<String> loadResourceTypesFromExcel(Resource fileResource, String logName) {
        List<String> resourceTypes = new ArrayList<>();
        try (InputStream is = fileResource.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {
            
            Sheet sheet = workbook.getSheetAt(0); // Get the first sheet
            for (Row row : sheet) {
                // Get the first cell (column A)
                Cell cell = row.getCell(0, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                if (cell != null && cell.getCellType() == CellType.STRING) {
                    String value = cell.getStringCellValue().trim();
                    if (!value.isEmpty()) {
                        resourceTypes.add(value);
                    }
                }
            }
            System.out.println("Loaded " + resourceTypes.size() + " " + logName + " resource types from Excel.");
        
        } catch (Exception e) {
            System.err.println("Failed to load " + logName + " master data from Excel: " + e.getMessage());
            // Return an empty list, but don't crash the server
        }
        return resourceTypes;
    }
}