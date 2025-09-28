package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.entity.AuthUser;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.entity.Team;
import com.internsystem.internmanagement.entity.TeamMember;
import com.internsystem.internmanagement.entity.Project;
import com.internsystem.internmanagement.entity.ProjectStatus;
import com.internsystem.internmanagement.dto.ProjectTeamDTO;
import com.internsystem.internmanagement.repository.InternRepository;
import com.internsystem.internmanagement.repository.TeamRepository;
import com.internsystem.internmanagement.repository.TeamMemberRepository;
import com.internsystem.internmanagement.repository.ProjectRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class BulkImportService {

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectTeamService projectTeamService;
    
    @Autowired
    private InternAuthUserLinkService internAuthUserLinkService;
    
    @Autowired
    private AuthRoleService authRoleService;

    @Transactional
    public BulkImportResult importBulkData(MultipartFile file) {
        BulkImportResult result = new BulkImportResult();
        
        try {
            List<String[]> dataRows = new ArrayList<>();
            String filename = file.getOriginalFilename();
            
            if (filename != null && filename.toLowerCase().endsWith(".xlsx")) {
                // Handle Excel file
                dataRows = parseExcelFile(file);
            } else {
                // Handle CSV file
                dataRows = parseCsvFile(file);
            }
            
            // Process in three phases to ensure correct hierarchy
            processInternDataFromRows(dataRows, result);
            processTeamDataFromRows(dataRows, result);
            processProjectDataFromRows(dataRows, result);
            
        } catch (Exception e) {
            result.addError(0, "File processing error: " + e.getMessage());
        }
        
        return result;
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
            
            // Try to determine if it's .xlsx or .xls
            if (file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
                workbook = new XSSFWorkbook(inputStream);
            } else {
                workbook = new HSSFWorkbook(inputStream);
            }
            
            Sheet sheet = workbook.getSheetAt(0); // Get first sheet
            Iterator<Row> rowIterator = sheet.iterator();
            
            // Skip header row
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }
            
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                String[] values = new String[14]; // Updated to expect 14 columns (phone removed)
                
                for (int i = 0; i < 14; i++) {
                    Cell cell = row.getCell(i);
                    if (cell == null) {
                        values[i] = "";
                    } else {
                        switch (cell.getCellType()) {
                            case STRING:
                                values[i] = cell.getStringCellValue();
                                break;
                            case NUMERIC:
                                if (DateUtil.isCellDateFormatted(cell)) {
                                    values[i] = cell.getLocalDateTimeCellValue().toLocalDate().toString();
                                } else {
                                    values[i] = String.valueOf((long) cell.getNumericCellValue());
                                }
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
    
    private void processInternDataFromRows(List<String[]> dataRows, BulkImportResult result) {
        Set<String> processedInterns = new HashSet<>();
        
        for (int i = 0; i < dataRows.size(); i++) {
            try {
                String[] values = dataRows.get(i);
                if (values.length < 14) continue; // Updated to expect 14 columns
                
                String internCode = values[0].trim();
                if (internCode.isEmpty() || processedInterns.contains(internCode)) {
                    continue; // Skip if already processed
                }
                
                String internName = values[1].trim();
                String email = values[2].trim();
                String institute = values[3].trim();
                String trainingStartDate = values[4].trim();
                String trainingEndDate = values[5].trim();
                
                if (internCode.isEmpty() || internName.isEmpty()) {
                    continue; // Skip invalid entries
                }
                
                createOrGetIntern(internCode, internName, email, institute, trainingStartDate, trainingEndDate);
                processedInterns.add(internCode);
                
            } catch (Exception e) {
                result.addError(i + 2, "Intern processing error: " + e.getMessage());
                result.incrementFailedCount();
            }
        }
    }
    
    private void processTeamDataFromRows(List<String[]> dataRows, BulkImportResult result) {
        Set<String> processedTeams = new HashSet<>();
        Map<String, String> teamLeaderMap = new HashMap<>();
        
        // First pass: identify team leaders from team_leader_intern_code column
        for (String[] values : dataRows) {
            try {
                if (values.length < 14) continue; // Updated to expect 14 columns
                
                String teamName = values[6].trim();  // Moved from index 7 to 6
                String teamLeaderInternCode = values[7].trim(); // Moved from index 8 to 7
                
                if (!teamName.isEmpty() && !teamLeaderInternCode.isEmpty()) {
                    teamLeaderMap.put(teamName, teamLeaderInternCode);
                }
            } catch (Exception e) {
                // Skip problematic lines in first pass
            }
        }
        
        // Second pass: create teams with identified leaders
        for (int i = 0; i < dataRows.size(); i++) {
            try {
                String[] values = dataRows.get(i);
                if (values.length < 14) continue; // Updated to expect 14 columns
                
                String teamName = values[6].trim();  // Moved from index 7 to 6
                if (teamName.isEmpty() || processedTeams.contains(teamName)) {
                    continue; // Skip if already processed
                }
                
                String teamLeaderInternCode = teamLeaderMap.get(teamName);
                Intern teamLeader = null;
                if (teamLeaderInternCode != null && !teamLeaderInternCode.isEmpty()) {
                    teamLeader = getInternByCode(teamLeaderInternCode);
                }
                
                createOrGetTeam(teamName, teamLeader);
                processedTeams.add(teamName);
                
            } catch (Exception e) {
                result.addError(i + 2, "Team processing error: " + e.getMessage());
                result.incrementFailedCount();
            }
        }
    }
    
    private void processProjectDataFromRows(List<String[]> dataRows, BulkImportResult result) {
        for (int i = 0; i < dataRows.size(); i++) {
            try {
                String[] values = dataRows.get(i);
                if (values.length < 14) {
                    result.addError(i + 2, "Invalid format: expected 14 columns");
                    result.incrementFailedCount();
                    continue;
                }
                
                // Parse all values with correct column indices (after removing phone column)
                String internCode = values[0].trim();
                String teamName = values[6].trim();  // Moved from index 7 to 6
                // values[7] is team_leader_intern_code (moved from index 8 to 7)
                String projectName = values[8].trim();  // Moved from index 9 to 8
                String projectDescription = values[9].trim();  // Moved from index 10 to 9
                String projectManagerId = values[10].trim(); // Moved from index 11 to 10
                String projectStatus = values[11].trim();  // Moved from index 12 to 11
                String projectStartDate = values[12].trim();  // Moved from index 13 to 12
                String projectTargetDate = values[13].trim();  // Moved from index 14 to 13
                
                // Validate required fields
                if (internCode.isEmpty() || teamName.isEmpty() || projectName.isEmpty()) {
                    result.addError(i + 2, "Required fields missing");
                    result.incrementFailedCount();
                    continue;
                }
                
                // Get existing entities
                Intern intern = getInternByCode(internCode);
                if (intern == null) {
                    result.addError(i + 2, "Intern with code '" + internCode + "' not found");
                    result.incrementFailedCount();
                    continue;
                }
                
                Team team = getTeamByName(teamName);
                if (team == null) {
                    result.addError(i + 2, "Team '" + teamName + "' not found");
                    result.incrementFailedCount();
                    continue;
                }
                
                // Check if intern is already a team member
                if (!isInternTeamMember(intern, team)) {
                    createTeamMember(intern, team);
                }
                
                // Handle project creation/assignment
                Project project = getProjectByName(projectName);
                if (project == null) {
                    // Get project manager if specified
                    Intern projectManager = null;
                    if (!projectManagerId.isEmpty()) {
                        projectManager = getInternByCode(projectManagerId);
                        if (projectManager == null) {
                            result.addError(i + 2, "Project manager with code '" + projectManagerId + "' not found");
                        }
                    }
                    
                    project = createProject(projectName, projectDescription, projectStatus, 
                                          projectStartDate, projectTargetDate, team, projectManager);
                } else {
                    // Project exists, check if this team is already assigned to it
                    if (!isTeamAssignedToProject(project.getProjectId(), team.getTeamId())) {
                        projectTeamService.assignTeamToProject(project.getProjectId(), team.getTeamId());
                    }
                }
                
                result.incrementSuccessCount();
                
            } catch (Exception e) {
                result.addError(i + 2, "Project processing error: " + e.getMessage());
                result.incrementFailedCount();
            }
        }
    }
    
    private Intern createOrGetIntern(String internCode, String name, String email, 
                                   String institute, String startDate, String endDate) {
        Optional<Intern> existing = internRepository.findByInternCode(internCode);
        
        if (existing.isPresent()) {
            // Update existing intern if new data provided
            Intern intern = existing.get();
            if (!name.isEmpty()) intern.setName(name);
            if (!email.isEmpty()) intern.setEmail(email);
            if (!institute.isEmpty()) intern.setInstitute(institute);
            if (!startDate.isEmpty()) intern.setTrainingStartDate(parseDate(startDate));
            if (!endDate.isEmpty()) intern.setTrainingEndDate(parseDate(endDate));
            return internRepository.save(intern);
        } else {
            // Create new intern
            Intern intern = new Intern();
            intern.setInternCode(internCode);
            intern.setName(name);
            intern.setEmail(email);
            intern.setInstitute(institute);
            if (!startDate.isEmpty()) intern.setTrainingStartDate(parseDate(startDate));
            if (!endDate.isEmpty()) intern.setTrainingEndDate(parseDate(endDate));
            Intern savedIntern = internRepository.save(intern);
            
            // Automatically create AuthUser record for this new intern
            authRoleService.ensureAuthUserExists(savedIntern.getInternId());
            
            return savedIntern;
        }
    }
    
    private Intern getInternByCode(String internCode) {
        return internRepository.findByInternCode(internCode).orElse(null);
    }
    
    private Team getTeamByName(String teamName) {
        return teamRepository.findByTeamName(teamName).orElse(null);
    }
    
    private Team createOrGetTeam(String teamName, Intern teamLeader) {
        Optional<Team> existing = teamRepository.findByTeamName(teamName);
        
        if (existing.isPresent()) {
            Team team = existing.get();
            // Update team leader if different
            if (teamLeader != null && (team.getTeamLeader() == null || 
                !team.getTeamLeader().getInternId().equals(teamLeader.getInternId()))) {
                team.setTeamLeader(teamLeader);
                
                // Find corresponding AuthUser for the team leader
                Optional<AuthUser> authUserOpt = internAuthUserLinkService.findAuthUserForIntern(teamLeader);
                if (authUserOpt.isPresent()) {
                    team.setTeamLeaderAuthUser(authUserOpt.get());
                }
                
                team = teamRepository.save(team);
                
                // Add new leader as team member if not already
                if (!teamMemberRepository.existsByTeamTeamIdAndInternInternId(team.getTeamId(), teamLeader.getInternId())) {
                    TeamMember leaderMember = new TeamMember();
                    leaderMember.setTeam(team);
                    leaderMember.setIntern(teamLeader);
                    teamMemberRepository.save(leaderMember);
                }
            }
            return team;
        } else {
            // Create new team
            Team team = new Team();
            team.setTeamName(teamName);
            team.setTeamLeader(teamLeader);
            
            // Find corresponding AuthUser for the team leader
            if (teamLeader != null) {
                Optional<AuthUser> authUserOpt = internAuthUserLinkService.findAuthUserForIntern(teamLeader);
                if (authUserOpt.isPresent()) {
                    team.setTeamLeaderAuthUser(authUserOpt.get());
                }
            }
            
            team = teamRepository.save(team);
            
            // Add leader as team member
            if (teamLeader != null) {
                TeamMember leaderMember = new TeamMember();
                leaderMember.setTeam(team);
                leaderMember.setIntern(teamLeader);
                teamMemberRepository.save(leaderMember);
            }
            
            return team;
        }
    }
    
    private boolean isInternTeamMember(Intern intern, Team team) {
        return teamMemberRepository.existsByTeamTeamIdAndInternInternId(team.getTeamId(), intern.getInternId());
    }
    
    private void createTeamMember(Intern intern, Team team) {
        if (!isInternTeamMember(intern, team)) {
            TeamMember teamMember = new TeamMember();
            teamMember.setTeam(team);
            teamMember.setIntern(intern);
            teamMemberRepository.save(teamMember);
        }
    }
    
    private Project getProjectByName(String projectName) {
        return projectRepository.findByProjectName(projectName).orElse(null);
    }
    
    private boolean isTeamAssignedToProject(Long projectId, Long teamId) {
        List<ProjectTeamDTO> projectTeams = projectTeamService.getTeamsByProjectId(projectId);
        return projectTeams.stream().anyMatch(pt -> pt.getTeamId().equals(teamId));
    }
    
    private Project createProject(String projectName, String description, String status, 
                                String startDate, String targetDate, Team assignedTeam, Intern projectManager) {
        Project project = new Project();
        project.setProjectName(projectName);
        project.setDescription(description);
        
        // Parse project status
        try {
            project.setStatus(ProjectStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            project.setStatus(ProjectStatus.PLANNED);
        }
        
        if (!startDate.isEmpty()) {
            project.setStartDate(parseDate(startDate));
        }
        if (!targetDate.isEmpty()) {
            project.setTargetDate(parseDate(targetDate));
        }
        
        // Set project manager - prioritize provided project manager, fallback to team leader
        if (projectManager != null) {
            project.setProjectManager(projectManager);
            
            // Find corresponding AuthUser for the project manager
            Optional<AuthUser> authUserOpt = internAuthUserLinkService.findAuthUserForIntern(projectManager);
            if (authUserOpt.isPresent()) {
                project.setProjectManagerAuthUser(authUserOpt.get());
            }
        } else if (assignedTeam != null && assignedTeam.getTeamLeader() != null) {
            project.setProjectManager(assignedTeam.getTeamLeader());
            
            // Find corresponding AuthUser for the team leader (acting as project manager)
            Optional<AuthUser> authUserOpt = internAuthUserLinkService.findAuthUserForIntern(assignedTeam.getTeamLeader());
            if (authUserOpt.isPresent()) {
                project.setProjectManagerAuthUser(authUserOpt.get());
            }
        }
        
        Project savedProject = projectRepository.save(project);
        
        // Create project-team relationship if team is assigned
        if (assignedTeam != null) {
            projectTeamService.assignTeamToProject(savedProject.getProjectId(), assignedTeam.getTeamId());
        }
        
        return savedProject;
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
    
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        
        dateStr = dateStr.trim();
        
        // Try multiple date formats
        DateTimeFormatter[] formatters = {
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),      // DD/MM/YYYY
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),      // DD-MM-YYYY
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),      // YYYY-MM-DD
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),      // MM/DD/YYYY
            DateTimeFormatter.ofPattern("MM-dd-yyyy"),      // MM-DD-YYYY
            DateTimeFormatter.ofPattern("dd.MM.yyyy"),      // DD.MM.YYYY
            DateTimeFormatter.ofPattern("yyyy.MM.dd")       // YYYY.MM.DD
        };
        
        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (Exception e) {
                // Continue to next formatter
            }
        }
        
        // If all formatters fail, try to handle Excel numeric date format
        try {
            // Check if it's a numeric value (Excel date serial number)
            double excelDate = Double.parseDouble(dateStr);
            // Excel date serial number starts from 1900-01-01 (but Excel thinks 1900 is a leap year)
            LocalDate excelEpoch = LocalDate.of(1900, 1, 1);
            return excelEpoch.plusDays((long) excelDate - 2); // -2 to account for Excel's leap year bug
        } catch (NumberFormatException e) {
            // Not a numeric date
        }
        
        throw new IllegalArgumentException("Unable to parse date: " + dateStr + ". Supported formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, MM/DD/YYYY, MM-DD-YYYY, DD.MM.YYYY, YYYY.MM.DD");
    }
    
    public static class BulkImportResult {
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

    public String exportBulkData() {
        StringBuilder csvBuilder = new StringBuilder();
        
        // Add header
        csvBuilder.append("intern_code,name,email,institute,training_start_date,training_end_date,team_name,team_leader_intern_code,project_name,project_description,project_manager_id,project_status,project_start_date,project_target_date\n");
        
        // Get all data with joins
        List<Intern> allInterns = internRepository.findAll();
        List<Team> allTeams = teamRepository.findAll();
        List<TeamMember> allTeamMembers = teamMemberRepository.findAll();
        List<Project> allProjects = projectRepository.findAll();
        
        // Create maps for quick lookup
        Map<Long, Team> teamMap = new HashMap<>();
        for (Team team : allTeams) {
            teamMap.put(team.getTeamId(), team);
        }
        
        Map<Long, Project> projectMap = new HashMap<>(); 
        for (Project project : allProjects) {
            projectMap.put(project.getProjectId(), project);
        }
        
        // Map intern to teams
        Map<Long, List<Team>> internTeamMap = new HashMap<>();
        for (TeamMember teamMember : allTeamMembers) {
            Long internId = teamMember.getIntern().getInternId();
            Long teamId = teamMember.getTeam().getTeamId();
            Team team = teamMap.get(teamId);
            if (team != null) {
                internTeamMap.computeIfAbsent(internId, k -> new ArrayList<>()).add(team);
            }
        }
        
        // Map team to projects using ProjectTeam relationships
        Map<Long, List<Project>> teamProjectMap = new HashMap<>();
        List<ProjectTeamDTO> projectTeams = projectTeamService.getAllProjectTeams();
                
        for (ProjectTeamDTO projectTeam : projectTeams) {
            Project project = projectMap.get(projectTeam.getProjectId());
            if (project != null) {
                teamProjectMap.computeIfAbsent(projectTeam.getTeamId(), k -> new ArrayList<>()).add(project);
            }
        }
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        
        // Generate CSV rows
        for (Intern intern : allInterns) {
            List<Team> internTeams = internTeamMap.getOrDefault(intern.getInternId(), new ArrayList<>());
            
            if (internTeams.isEmpty()) {
                // Intern not in any team
                csvBuilder.append(escapeForCsv(intern.getInternCode())).append(",")
                    .append(escapeForCsv(intern.getName())).append(",")
                    .append(escapeForCsv(intern.getEmail())).append(",")
                    .append(escapeForCsv(intern.getInstitute())).append(",")
                    .append(intern.getTrainingStartDate() != null ? intern.getTrainingStartDate().format(formatter) : "").append(",")
                    .append(intern.getTrainingEndDate() != null ? intern.getTrainingEndDate().format(formatter) : "").append(",")
                    .append(",") // team_name
                    .append(",") // team_leader_intern_code
                    .append(",") // project_name
                    .append(",") // project_description
                    .append(",") // project_manager_id
                    .append(",") // project_status
                    .append(",") // project_start_date
                    .append("\n"); // project_target_date
            } else {
                // Intern is in teams
                for (Team team : internTeams) {
                    List<Project> teamProjects = teamProjectMap.getOrDefault(team.getTeamId(), new ArrayList<>());
                    
                    if (teamProjects.isEmpty()) {
                        // Team has no projects, but check if intern has projects through other teams
                        Set<Project> allInternProjects = new HashSet<>();
                        for (Team otherTeam : internTeams) {
                            allInternProjects.addAll(teamProjectMap.getOrDefault(otherTeam.getTeamId(), new ArrayList<>()));
                        }
                        
                        if (allInternProjects.isEmpty()) {
                            // Intern has no projects at all
                            csvBuilder.append(escapeForCsv(intern.getInternCode())).append(",")
                                .append(escapeForCsv(intern.getName())).append(",")
                                .append(escapeForCsv(intern.getEmail())).append(",")
                                .append(escapeForCsv(intern.getInstitute())).append(",")
                                .append(intern.getTrainingStartDate() != null ? intern.getTrainingStartDate().format(formatter) : "").append(",")
                                .append(intern.getTrainingEndDate() != null ? intern.getTrainingEndDate().format(formatter) : "").append(",")
                                .append(escapeForCsv(team.getTeamName())).append(",")
                                .append(escapeForCsv(team.getTeamLeader().getInternCode())).append(",") // team_leader_intern_code
                                .append(",") // project_name
                                .append(",") // project_description
                                .append(",") // project_manager_id
                                .append(",") // project_status
                                .append(",") // project_start_date
                                .append("\n"); // project_target_date
                        } else {
                            // Show all intern's projects even for teams without direct project assignment
                            for (Project project : allInternProjects) {
                                csvBuilder.append(escapeForCsv(intern.getInternCode())).append(",")
                                    .append(escapeForCsv(intern.getName())).append(",")
                                    .append(escapeForCsv(intern.getEmail())).append(",")
                                    .append(escapeForCsv(intern.getInstitute())).append(",")
                                    .append(intern.getTrainingStartDate() != null ? intern.getTrainingStartDate().format(formatter) : "").append(",")
                                    .append(intern.getTrainingEndDate() != null ? intern.getTrainingEndDate().format(formatter) : "").append(",")
                                    .append(escapeForCsv(team.getTeamName())).append(",")
                                    .append(escapeForCsv(team.getTeamLeader().getInternCode())).append(",") // team_leader_intern_code
                                    .append(escapeForCsv(project.getProjectName())).append(",")
                                    .append(escapeForCsv(project.getDescription())).append(",")
                                    .append(project.getProjectManager() != null ? escapeForCsv(project.getProjectManager().getInternCode()) : "").append(",") // project_manager_id
                                    .append(project.getStatus() != null ? project.getStatus().toString() : "").append(",")
                                    .append(project.getStartDate() != null ? project.getStartDate().format(formatter) : "").append(",")
                                    .append(project.getTargetDate() != null ? project.getTargetDate().format(formatter) : "").append("\n");
                            }
                        }
                    } else {
                        // Team has projects
                        for (Project project : teamProjects) {
                            csvBuilder.append(escapeForCsv(intern.getInternCode())).append(",")
                                .append(escapeForCsv(intern.getName())).append(",")
                                .append(escapeForCsv(intern.getEmail())).append(",")
                                .append(escapeForCsv(intern.getInstitute())).append(",")
                                .append(intern.getTrainingStartDate() != null ? intern.getTrainingStartDate().format(formatter) : "").append(",")
                                .append(intern.getTrainingEndDate() != null ? intern.getTrainingEndDate().format(formatter) : "").append(",")
                                .append(escapeForCsv(team.getTeamName())).append(",")
                                .append(escapeForCsv(team.getTeamLeader().getInternCode())).append(",") // team_leader_intern_code
                                .append(escapeForCsv(project.getProjectName())).append(",")
                                .append(escapeForCsv(project.getDescription())).append(",")
                                .append(project.getProjectManager() != null ? escapeForCsv(project.getProjectManager().getInternCode()) : "").append(",") // project_manager_id
                                .append(project.getStatus() != null ? project.getStatus().toString() : "").append(",")
                                .append(project.getStartDate() != null ? project.getStartDate().format(formatter) : "").append(",")
                                .append(project.getTargetDate() != null ? project.getTargetDate().format(formatter) : "").append("\n");
                        }
                    }
                }
            }
        }
        
        return csvBuilder.toString();
    }
    
    public byte[] exportBulkDataAsExcel() {
        try {
            // Get all data with joins
            List<Intern> allInterns = internRepository.findAll();
            List<Team> allTeams = teamRepository.findAll();
            List<TeamMember> allTeamMembers = teamMemberRepository.findAll();
            List<Project> allProjects = projectRepository.findAll();
            
            // Create maps for quick lookup
            Map<Long, Team> teamMap = new HashMap<>();
            for (Team team : allTeams) {
                teamMap.put(team.getTeamId(), team);
            }
            
            Map<Long, Project> projectMap = new HashMap<>(); 
            for (Project project : allProjects) {
                projectMap.put(project.getProjectId(), project);
            }
            
            // Map intern to teams
            Map<Long, List<Team>> internTeamMap = new HashMap<>();
            for (TeamMember teamMember : allTeamMembers) {
                Long internId = teamMember.getIntern().getInternId();
                Long teamId = teamMember.getTeam().getTeamId();
                Team team = teamMap.get(teamId);
                if (team != null) {
                    internTeamMap.computeIfAbsent(internId, k -> new ArrayList<>()).add(team);
                }
            }
            
            // Map team to projects using ProjectTeam relationships
            Map<Long, List<Project>> teamProjectMap = new HashMap<>();
            List<ProjectTeamDTO> projectTeams = projectTeamService.getAllProjectTeams();
                    
            for (ProjectTeamDTO projectTeam : projectTeams) {
                Project project = projectMap.get(projectTeam.getProjectId());
                if (project != null) {
                    teamProjectMap.computeIfAbsent(projectTeam.getTeamId(), k -> new ArrayList<>()).add(project);
                }
            }
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            
            // Create Excel workbook
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Data");
            
            // Create styles for formatting
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
            
            // Create data cell style
            CellStyle dataStyle = workbook.createCellStyle();
            Font dataFont = workbook.createFont();
            dataFont.setFontHeightInPoints((short) 10);
            dataStyle.setFont(dataFont);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create date cell style
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.cloneStyleFrom(dataStyle);
            CreationHelper createHelper = workbook.getCreationHelper();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd-mm-yyyy"));
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.setHeight((short) 400); // Set header row height
            String[] headers = {
                "intern_code", "name", "email", "institute", 
                "training_start_date", "training_end_date", "team_name", 
                "team_leader_intern_code", "project_name", "project_description", 
                "project_manager_id", "project_status", "project_start_date", "project_target_date"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Generate data rows
            int rowNum = 1;
            for (Intern intern : allInterns) {
                List<Team> internTeams = internTeamMap.getOrDefault(intern.getInternId(), new ArrayList<>());
                
                if (internTeams.isEmpty()) {
                    // Intern with no teams
                    Row row = sheet.createRow(rowNum++);
                    fillInternRowWithStyle(row, intern, null, null, formatter, dataStyle, dateStyle);
                } else {
                    // Intern with teams and projects
                    for (Team team : internTeams) {
                        List<Project> teamProjects = teamProjectMap.getOrDefault(team.getTeamId(), new ArrayList<>());
                        
                        if (teamProjects.isEmpty()) {
                            // Team has no projects, but check if intern has projects through other teams
                            Set<Project> allInternProjects = new HashSet<>();
                            for (Team otherTeam : internTeams) {
                                allInternProjects.addAll(teamProjectMap.getOrDefault(otherTeam.getTeamId(), new ArrayList<>()));
                            }
                            
                            if (allInternProjects.isEmpty()) {
                                // Intern has no projects at all
                                Row row = sheet.createRow(rowNum++);
                                fillInternRowWithStyle(row, intern, team, null, formatter, dataStyle, dateStyle);
                            } else {
                                // Show all intern's projects even for teams without direct project assignment
                                for (Project project : allInternProjects) {
                                    Row row = sheet.createRow(rowNum++);
                                    fillInternRowWithStyle(row, intern, team, project, formatter, dataStyle, dateStyle);
                                }
                            }
                        } else {
                            // Team has projects
                            for (Project project : teamProjects) {
                                Row row = sheet.createRow(rowNum++);
                                fillInternRowWithStyle(row, intern, team, project, formatter, dataStyle, dateStyle);
                            }
                        }
                    }
                }
            }
            
            // Set uniform column widths (in units of 1/256th of a character width)
            int uniformWidth = 17 * 256; // 20 characters wide
            for (int i = 0; i < headers.length; i++) {
                sheet.setColumnWidth(i, uniformWidth);
            }
            // Customize specific column widths
            sheet.setColumnWidth(0, 11 * 256); // Set column 0 to 30 characters wide
            sheet.setColumnWidth(1, 34 * 256);
            sheet.setColumnWidth(2, 34 * 256);
            sheet.setColumnWidth(3, 12 * 256);
            sheet.setColumnWidth(4, 20 * 256);
            sheet.setColumnWidth(7, 20 * 256);
            sheet.setColumnWidth(8, 11 * 256);
            sheet.setColumnWidth(9, 28 * 256);
            sheet.setColumnWidth(10, 34 * 256);
            sheet.setColumnWidth(11, 11 * 256); // project_manager_id
            sheet.setColumnWidth(12, 14 * 256); // project_status

            // Convert to byte array
            java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();
            
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel export", e);
        }
    }
    
    private void fillInternRowWithStyle(Row row, Intern intern, Team team, Project project, DateTimeFormatter formatter, CellStyle dataStyle, CellStyle dateStyle) {
        int cellNum = 0;
        
        // Intern data
        Cell cell0 = row.createCell(cellNum++);
        cell0.setCellValue(intern.getInternCode() != null ? intern.getInternCode() : "");
        cell0.setCellStyle(dataStyle);
        
        Cell cell1 = row.createCell(cellNum++);
        cell1.setCellValue(intern.getName() != null ? intern.getName() : "");
        cell1.setCellStyle(dataStyle);
        
        Cell cell2 = row.createCell(cellNum++);
        cell2.setCellValue(intern.getEmail() != null ? intern.getEmail() : "");
        cell2.setCellStyle(dataStyle);
        
        Cell cell3 = row.createCell(cellNum++);
        cell3.setCellValue(intern.getInstitute() != null ? intern.getInstitute() : "");
        cell3.setCellStyle(dataStyle);
        
        // Training start date - use actual date value
        Cell cell5 = row.createCell(cellNum++);
        if (intern.getTrainingStartDate() != null) {
            cell5.setCellValue(java.sql.Date.valueOf(intern.getTrainingStartDate()));
            cell5.setCellStyle(dateStyle);
        } else {
            cell5.setCellValue("");
            cell5.setCellStyle(dataStyle);
        }
        
        // Training end date - use actual date value
        Cell cell6 = row.createCell(cellNum++);
        if (intern.getTrainingEndDate() != null) {
            cell6.setCellValue(java.sql.Date.valueOf(intern.getTrainingEndDate()));
            cell6.setCellStyle(dateStyle);
        } else {
            cell6.setCellValue("");
            cell6.setCellStyle(dataStyle);
        }
        
        // Team data
        Cell cell7 = row.createCell(cellNum++);
        cell7.setCellValue(team != null ? team.getTeamName() : "");
        cell7.setCellStyle(dataStyle);
        
        Cell cell8 = row.createCell(cellNum++);
        cell8.setCellValue(team != null && team.getTeamLeader() != null ? team.getTeamLeader().getInternCode() : "");
        cell8.setCellStyle(dataStyle);
        
        // Project data
        Cell cell9 = row.createCell(cellNum++);
        cell9.setCellValue(project != null ? project.getProjectName() : "");
        cell9.setCellStyle(dataStyle);
        
        Cell cell10 = row.createCell(cellNum++);
        cell10.setCellValue(project != null ? project.getDescription() : "");
        cell10.setCellStyle(dataStyle);
        
        Cell cell11 = row.createCell(cellNum++);
        cell11.setCellValue(project != null && project.getProjectManager() != null ? project.getProjectManager().getInternCode() : "");
        cell11.setCellStyle(dataStyle);
        
        Cell cell12 = row.createCell(cellNum++);
        cell12.setCellValue(project != null ? project.getStatus().toString() : "");
        cell12.setCellStyle(dataStyle);
        
        // Project start date - use actual date value
        Cell cell13 = row.createCell(cellNum++);
        if (project != null && project.getStartDate() != null) {
            cell13.setCellValue(java.sql.Date.valueOf(project.getStartDate()));
            cell13.setCellStyle(dateStyle);
        } else {
            cell13.setCellValue("");
            cell13.setCellStyle(dataStyle);
        }
        
        // Project target date - use actual date value
        Cell cell14 = row.createCell(cellNum++);
        if (project != null && project.getTargetDate() != null) {
            cell14.setCellValue(java.sql.Date.valueOf(project.getTargetDate()));
            cell14.setCellStyle(dateStyle);
        } else {
            cell14.setCellValue("");
            cell14.setCellStyle(dataStyle);
        }
    }
    
    private String escapeForCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
