package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.entity.Function;
import com.internsystem.internmanagement.entity.FunctionStatus;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.entity.Module;
import com.internsystem.internmanagement.entity.ModuleStatus;
import com.internsystem.internmanagement.entity.Project;
import com.internsystem.internmanagement.entity.TeamMember;
import com.internsystem.internmanagement.repository.FunctionRepository;
import com.internsystem.internmanagement.repository.InternRepository;
import com.internsystem.internmanagement.repository.ModuleRepository;
import com.internsystem.internmanagement.repository.ProjectRepository;
import com.internsystem.internmanagement.repository.TeamMemberRepository;
import com.internsystem.internmanagement.dto.ProjectTeamDTO;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class ModuleImportService {

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private FunctionRepository functionRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private ProjectTeamService projectTeamService;

    @Transactional
    public ModuleImportResult importModulesAndFunctions(MultipartFile file, Long projectId) {
        ModuleImportResult result = new ModuleImportResult();
        
        try {
            // Validate project exists
            Project project = projectRepository.findById(projectId).orElse(null);
            if (project == null) {
                result.addError(0, "Project not found with ID: " + projectId);
                return result;
            }

            // Get team members for this project to validate assignments
            Set<Long> validInternIds = getValidInternIdsForProject(projectId);
            
            List<String[]> dataRows = new ArrayList<>();
            String filename = file.getOriginalFilename();
            
            if (filename != null && filename.toLowerCase().endsWith(".xlsx")) {
                dataRows = parseExcelFile(file);
            } else {
                dataRows = parseCsvFile(file);
            }
            
            // Process in two phases: modules first, then functions
            Map<String, Module> createdModules = processModuleDataFromRows(dataRows, result, project, validInternIds);
            processFunctionDataFromRows(dataRows, result, createdModules, validInternIds);
            
        } catch (Exception e) {
            result.addError(0, "File processing error: " + e.getMessage());
        }
        
        return result;
    }

    private Set<Long> getValidInternIdsForProject(Long projectId) {
        Set<Long> validInternIds = new HashSet<>();
        
        // Get all teams assigned to this project
        List<ProjectTeamDTO> projectTeams = projectTeamService.getTeamsByProjectId(projectId);
        
        // Get all team members from these teams
        for (ProjectTeamDTO projectTeam : projectTeams) {
            List<TeamMember> teamMembers = teamMemberRepository.findByTeamTeamId(projectTeam.getTeamId());
            for (TeamMember teamMember : teamMembers) {
                validInternIds.add(teamMember.getIntern().getInternId());
            }
        }
        
        return validInternIds;
    }

    private List<String[]> parseCsvFile(MultipartFile file) throws Exception {
        List<String[]> dataRows = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;
            
            while ((line = reader.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // Skip header
                }
                if (!line.trim().isEmpty()) {
                    String[] values = parseCsvLineInternal(line);
                    dataRows.add(values);
                }
            }
        }
        
        return dataRows;
    }
    
    private List<String[]> parseExcelFile(MultipartFile file) throws Exception {
        List<String[]> dataRows = new ArrayList<>();
        
        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook;
            
            if (file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
                workbook = new XSSFWorkbook(inputStream);
            } else {
                workbook = new HSSFWorkbook(inputStream);
            }
            
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();
            
            // Skip header row
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }
            
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                String[] values = new String[8]; // Expecting 8 columns (added function_status)
                
                for (int i = 0; i < 8; i++) {
                    Cell cell = row.getCell(i);
                    if (cell == null) {
                        values[i] = "";
                    } else {
                        switch (cell.getCellType()) {
                            case STRING:
                                values[i] = cell.getStringCellValue();
                                break;
                            case NUMERIC:
                                values[i] = String.valueOf((long) cell.getNumericCellValue());
                                break;
                            case BOOLEAN:
                                values[i] = String.valueOf(cell.getBooleanCellValue());
                                break;
                            case FORMULA:
                                values[i] = cell.getCellFormula();
                                break;
                            default:
                                values[i] = "";
                        }
                    }
                }
                
                // Only add rows that have at least some data
                boolean hasData = false;
                for (String value : values) {
                    if (value != null && !value.trim().isEmpty()) {
                        hasData = true;
                        break;
                    }
                }
                
                if (hasData) {
                    dataRows.add(values);
                }
            }
            
            workbook.close();
        }
        
        return dataRows;
    }

    private Map<String, Module> processModuleDataFromRows(List<String[]> dataRows, ModuleImportResult result, Project project, Set<Long> validInternIds) {
        Map<String, Module> moduleMap = new HashMap<>();
        Set<String> processedModules = new HashSet<>();
        
        for (int i = 0; i < dataRows.size(); i++) {
            try {
                String[] values = dataRows.get(i);
                if (values.length < 8) {
                    result.addError(i + 2, "Invalid format: expected 8 columns");
                    result.incrementFailedCount();
                    continue;
                }
                
                String moduleName = values[0].trim();
                String moduleDescription = values[1].trim();
                String moduleOwnerInternCode = values[2].trim();
                String moduleStatus = values[3].trim();
                
                if (moduleName.isEmpty() || processedModules.contains(moduleName)) {
                    continue; // Skip if already processed or empty
                }
                
                // Validate module owner
                if (moduleOwnerInternCode.isEmpty()) {
                    result.addError(i + 2, "Module owner intern code is required");
                    result.incrementFailedCount();
                    continue;
                }
                
                Intern moduleOwner = getInternByCode(moduleOwnerInternCode);
                if (moduleOwner == null) {
                    result.addError(i + 2, "Module owner intern not found: " + moduleOwnerInternCode);
                    result.incrementFailedCount();
                    continue;
                }
                
                // Validate that intern is part of teams assigned to this project
                if (!validInternIds.contains(moduleOwner.getInternId())) {
                    result.addError(i + 2, "Module owner " + moduleOwnerInternCode + " is not part of any team assigned to this project");
                    result.incrementFailedCount();
                    continue;
                }
                
                Module module = createOrGetModule(moduleName, moduleDescription, project, moduleOwner, moduleStatus);
                moduleMap.put(moduleName, module);
                processedModules.add(moduleName);
                
            } catch (Exception e) {
                result.addError(i + 2, "Module processing error: " + e.getMessage());
                result.incrementFailedCount();
            }
        }
        
        return moduleMap;
    }

    private void processFunctionDataFromRows(List<String[]> dataRows, ModuleImportResult result, Map<String, Module> moduleMap, Set<Long> validInternIds) {
        for (int i = 0; i < dataRows.size(); i++) {
            try {
                String[] values = dataRows.get(i);
                if (values.length < 8) {
                    continue; // Already handled in module processing
                }
                
                String moduleName = values[0].trim();
                String functionName = values[4].trim();
                String functionDescription = values[5].trim();
                String functionDeveloperInternCode = values[6].trim();
                String functionStatus = values[7].trim(); // Added function_status
                
                // Validate required fields
                if (moduleName.isEmpty() || functionName.isEmpty()) {
                    result.addError(i + 2, "Module name and function name are required");
                    result.incrementFailedCount();
                    continue;
                }
                
                Module module = moduleMap.get(moduleName);
                if (module == null) {
                    result.addError(i + 2, "Module not found: " + moduleName);
                    result.incrementFailedCount();
                    continue;
                }
                
                // Validate function developer
                if (functionDeveloperInternCode.isEmpty()) {
                    result.addError(i + 2, "Function developer intern code is required");
                    result.incrementFailedCount();
                    continue;
                }
                
                Intern functionDeveloper = getInternByCode(functionDeveloperInternCode);
                if (functionDeveloper == null) {
                    result.addError(i + 2, "Function developer intern not found: " + functionDeveloperInternCode);
                    result.incrementFailedCount();
                    continue;
                }
                
                // Validate that intern is part of teams assigned to this project
                if (!validInternIds.contains(functionDeveloper.getInternId())) {
                    result.addError(i + 2, "Function developer " + functionDeveloperInternCode + " is not part of any team assigned to this project");
                    result.incrementFailedCount();
                    continue;
                }
                
                createOrGetFunction(functionName, functionDescription, module, functionDeveloper, functionStatus);
                result.incrementSuccessCount();
                
            } catch (Exception e) {
                result.addError(i + 2, "Function processing error: " + e.getMessage());
                result.incrementFailedCount();
            }
        }
    }

    private Intern getInternByCode(String internCode) {
        return internRepository.findByInternCode(internCode).orElse(null);
    }

    private Module createOrGetModule(String moduleName, String description, Project project, Intern owner, String status) {
        // Check if module already exists for this project
        Optional<Module> existingModule = moduleRepository.findByModuleNameAndProjectProjectId(moduleName, project.getProjectId());
        
        if (existingModule.isPresent()) {
            // Update existing module
            Module module = existingModule.get();
            module.setDescription(description);
            module.setOwnerIntern(owner);
            try {
                module.setStatus(ModuleStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                module.setStatus(ModuleStatus.NOT_STARTED);
            }
            return moduleRepository.save(module);
        } else {
            // Create new module
            Module module = new Module();
            module.setModuleName(moduleName);
            module.setDescription(description);
            module.setProject(project);
            module.setOwnerIntern(owner);
            
            try {
                module.setStatus(ModuleStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                module.setStatus(ModuleStatus.NOT_STARTED);
            }
            
            return moduleRepository.save(module);
        }
    }

    private Function createOrGetFunction(String functionName, String description, Module module, Intern developer, String status) {
        // Check if function already exists for this module
        Optional<Function> existingFunction = functionRepository.findByFunctionNameAndModuleModuleId(functionName, module.getModuleId());
        
        if (existingFunction.isPresent()) {
            // Update existing function
            Function function = existingFunction.get();
            function.setDescription(description);
            function.setDeveloperIntern(developer);
            
            // Set function status
            try {
                function.setStatus(FunctionStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                function.setStatus(FunctionStatus.PENDING); // Default status
            }
            
            return functionRepository.save(function);
        } else {
            // Create new function
            Function function = new Function();
            function.setFunctionName(functionName);
            function.setDescription(description);
            function.setModule(module);
            function.setDeveloperIntern(developer);
            
            // Set function status
            try {
                function.setStatus(FunctionStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                function.setStatus(FunctionStatus.PENDING); // Default status
            }
            
            return functionRepository.save(function);
        }
    }

    private String[] parseCsvLineInternal(String line) {
        List<String> values = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder currentValue = new StringBuilder();
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                values.add(currentValue.toString());
                currentValue = new StringBuilder();
            } else {
                currentValue.append(c);
            }
        }
        
        values.add(currentValue.toString());
        return values.toArray(new String[0]);
    }

    public String exportModulesAndFunctions(Long projectId) {
        StringBuilder csvBuilder = new StringBuilder();
        
        // Add header
        csvBuilder.append("module_name,module_description,module_owner_intern_code,module_status,function_name,function_description,function_developer_intern_code,function_status\n");
        
        // Get all modules for this project
        List<Module> modules = moduleRepository.findByProjectProjectId(projectId);
        
        for (Module module : modules) {
            List<Function> functions = functionRepository.findByModuleModuleId(module.getModuleId());
            
            if (functions.isEmpty()) {
                // Module with no functions
                csvBuilder.append(escapeForCsv(module.getModuleName())).append(",")
                    .append(escapeForCsv(module.getDescription())).append(",")
                    .append(escapeForCsv(module.getOwnerIntern().getInternCode())).append(",")
                    .append(module.getStatus().toString()).append(",")
                    .append(",") // function_name
                    .append(",") // function_description
                    .append(",") // function_developer_intern_code
                    .append("\n"); // function_status
            } else {
                // Module with functions
                for (Function function : functions) {
                    csvBuilder.append(escapeForCsv(module.getModuleName())).append(",")
                        .append(escapeForCsv(module.getDescription())).append(",")
                        .append(escapeForCsv(module.getOwnerIntern().getInternCode())).append(",")
                        .append(module.getStatus().toString()).append(",")
                        .append(escapeForCsv(function.getFunctionName())).append(",")
                        .append(escapeForCsv(function.getDescription())).append(",")
                        .append(escapeForCsv(function.getDeveloperIntern().getInternCode())).append(",")
                        .append(function.getStatus() != null ? function.getStatus().toString() : "PENDING").append("\n");
                }
            }
        }
        
        return csvBuilder.toString();
    }

    public byte[] exportModulesAndFunctionsAsExcel(Long projectId) {
        try {
            // Get all modules for this project
            List<Module> modules = moduleRepository.findByProjectProjectId(projectId);
            
            // Create Excel workbook
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Modules and Functions");
            
            // Create styles
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 10);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            CellStyle dataStyle = workbook.createCellStyle();
            Font dataFont = workbook.createFont();
            dataFont.setFontHeightInPoints((short) 10);
            dataStyle.setFont(dataFont);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.setHeight((short) 400);
            String[] headers = {
                "module_name", "module_description", "module_owner_intern_code", 
                "module_status", "function_name", "function_description", "function_developer_intern_code", "function_status"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Generate data rows
            int rowNum = 1;
            for (Module module : modules) {
                List<Function> functions = functionRepository.findByModuleModuleId(module.getModuleId());
                
                if (functions.isEmpty()) {
                    // Module with no functions
                    Row row = sheet.createRow(rowNum++);
                    fillModuleRowWithStyle(row, module, null, dataStyle);
                } else {
                    // Module with functions
                    for (Function function : functions) {
                        Row row = sheet.createRow(rowNum++);
                        fillModuleRowWithStyle(row, module, function, dataStyle);
                    }
                }
            }
            
            // Set column widths
            sheet.setColumnWidth(0, 25 * 256); // module_name
            sheet.setColumnWidth(1, 40 * 256); // module_description
            sheet.setColumnWidth(2, 15 * 256); // module_owner_intern_code
            sheet.setColumnWidth(3, 15 * 256); // module_status
            sheet.setColumnWidth(4, 25 * 256); // function_name
            sheet.setColumnWidth(5, 40 * 256); // function_description
            sheet.setColumnWidth(6, 15 * 256); // function_developer_intern_code
            sheet.setColumnWidth(7, 15 * 256); // function_status
            
            // Convert to byte array
            java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();
            
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel export", e);
        }
    }

    private void fillModuleRowWithStyle(Row row, Module module, Function function, CellStyle dataStyle) {
        int cellNum = 0;
        
        // Module data
        Cell cell0 = row.createCell(cellNum++);
        cell0.setCellValue(module.getModuleName() != null ? module.getModuleName() : "");
        cell0.setCellStyle(dataStyle);
        
        Cell cell1 = row.createCell(cellNum++);
        cell1.setCellValue(module.getDescription() != null ? module.getDescription() : "");
        cell1.setCellStyle(dataStyle);
        
        Cell cell2 = row.createCell(cellNum++);
        cell2.setCellValue(module.getOwnerIntern() != null ? module.getOwnerIntern().getInternCode() : "");
        cell2.setCellStyle(dataStyle);
        
        Cell cell3 = row.createCell(cellNum++);
        cell3.setCellValue(module.getStatus() != null ? module.getStatus().toString() : "");
        cell3.setCellStyle(dataStyle);
        
        // Function data
        Cell cell4 = row.createCell(cellNum++);
        cell4.setCellValue(function != null ? function.getFunctionName() : "");
        cell4.setCellStyle(dataStyle);
        
        Cell cell5 = row.createCell(cellNum++);
        cell5.setCellValue(function != null ? function.getDescription() : "");
        cell5.setCellStyle(dataStyle);
        
        Cell cell6 = row.createCell(cellNum++);
        cell6.setCellValue(function != null && function.getDeveloperIntern() != null ? function.getDeveloperIntern().getInternCode() : "");
        cell6.setCellStyle(dataStyle);
        
        Cell cell7 = row.createCell(cellNum++);
        cell7.setCellValue(function != null && function.getStatus() != null ? function.getStatus().toString() : "");
        cell7.setCellStyle(dataStyle);
    }

    private String escapeForCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    public static class ModuleImportResult {
        private int successCount = 0;
        private int failedCount = 0;
        private List<String> errors = new ArrayList<>();
        
        public void incrementSuccessCount() {
            successCount++;
        }
        
        public void incrementFailedCount() {
            failedCount++;
        }
        
        public void addError(int lineNumber, String error) {
            errors.add("Line " + lineNumber + ": " + error);
        }
        
        public int getSuccessCount() { return successCount; }
        public int getFailedCount() { return failedCount; }
        public int getTotalCount() { return successCount + failedCount; }
        public List<String> getErrors() { return errors; }
    }
}
