package com.internsystem.internmanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.exception.ExistingResourceException;
import com.internsystem.internmanagement.exception.ResourceNotFoundException;
import com.internsystem.internmanagement.repository.InternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class InternService {

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private AuthRoleService authRoleService;
    
    @Autowired
    private StatsService statsService;

    @Value("${trainee.api.secret}")
    private String secretKey;

    private final String activeTraineesApiUrl = "https://prohub.slt.com.lk/ProhubTrainees/api/MainApi/AllActiveTrainees";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Intern> getAllInterns() {
        return internRepository.findAll();
    }

    public Intern createIntern(Intern intern) {
        // Check if intern code already exists
        if (internRepository.findByInternCode(intern.getInternCode()).isPresent()) {
            throw new ExistingResourceException("An intern with intern code '" + intern.getInternCode() + "' already exists");
        }
        Intern savedIntern = internRepository.save(intern);
        
        // Automatically create AuthUser record for this intern
        authRoleService.ensureAuthUserExists(savedIntern.getInternId());
        
        return savedIntern;
    }

    public Optional<Intern> getInternById(Long id) {
        return internRepository.findById(id);
    }

    public Optional<Intern> getInternByCode(String internCode) {
        return internRepository.findByInternCode(internCode);
    }

    public List<Intern> getInternsByCategoryId(Integer categoryId) {
        return internRepository.findByCategory_CategoryId(categoryId);
    }

    public Intern updateIntern(Long id, Intern updatedIntern) {
        Intern intern = internRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intern not found with ID: " + id));

        // Check if trying to update intern code to one that already exists (for a different intern)
        if (!intern.getInternCode().equals(updatedIntern.getInternCode())) {
            Optional<Intern> existingIntern = internRepository.findByInternCode(updatedIntern.getInternCode());
            if (existingIntern.isPresent() && !existingIntern.get().getInternId().equals(id)) {
                throw new ExistingResourceException("An intern with intern code '" + updatedIntern.getInternCode() + "' already exists");
            }
        }

        // Update all fields including intern code
        intern.setInternCode(updatedIntern.getInternCode());
        intern.setName(updatedIntern.getName());
        intern.setEmail(updatedIntern.getEmail());
        intern.setTrainingStartDate(updatedIntern.getTrainingStartDate());
        intern.setTrainingEndDate(updatedIntern.getTrainingEndDate());
        intern.setInstitute(updatedIntern.getInstitute());

        return internRepository.save(intern);
    }

    public void deleteIntern(Long id) {
        if (!internRepository.existsById(id)) {
            throw new ResourceNotFoundException("Intern not found with ID: " + id);
        }
        internRepository.deleteById(id);
    }

    @PostConstruct
    public void syncAllInternsOnStartup() {
        syncAllInternsFromApi();
    }

    public void syncAllInternsFromApi() {
        try {
            String requestBody = String.format("{\"secretKey\":\"%s\"}", secretKey);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(activeTraineesApiUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                
                // Support both old and new API response formats
                JsonNode traineesArray = null;
                
                // Check if response is new format (direct array)
                if (rootNode.isArray()) {
                    traineesArray = rootNode;
                    System.out.println("Using new API format (direct array)");
                } else {
                    // Check for old format (dataBundle wrapper)
                    JsonNode dataBundle = rootNode.get("dataBundle");
                    if (dataBundle != null && dataBundle.isArray()) {
                        traineesArray = dataBundle;
                        System.out.println("Using legacy API format (dataBundle wrapper)");
                    }
                }

                if (traineesArray != null && traineesArray.isArray()) {
                    int apiInternCount = traineesArray.size();
                    System.out.println("API returned " + apiInternCount + " active interns");
                    
                    // Update the active intern count in stats service
                    statsService.setActiveInternsFromApi(apiInternCount);
                    
                    // Support multiple date formats
                    DateTimeFormatter oldFormatter = DateTimeFormatter.ofPattern("M/d/yyyy");
                    DateTimeFormatter isoFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    
                    for (JsonNode trainee : traineesArray) {
                        // Handle both old and new field names
                        String traineeId = extractField(trainee, "internCode", "Trainee_ID");
                        String traineeName = extractField(trainee, "name", "Trainee_Name");
                        String traineeInstitute = extractField(trainee, "institute", "Institute");
                        String traineeEmail = extractField(trainee, "email", "Trainee_Email");
                        
                        LocalDate startDate = parseTrainingDate(trainee, "trainingStartDate", "Training_StartDate", isoFormatter, oldFormatter);
                        LocalDate endDate = parseTrainingDate(trainee, "trainingEndDate", "Training_EndDate", isoFormatter, oldFormatter);

                        // Find existing intern by internCode (traineeId)
                        Intern intern = internRepository.findByInternCode(traineeId)
                                .orElse(new Intern());
                        boolean isNewIntern = intern.getInternId() == null;
                        
                        intern.setInternCode(traineeId);
                        intern.setName(traineeName);
                        intern.setInstitute(traineeInstitute);
                        intern.setEmail(traineeEmail);
                        intern.setTrainingStartDate(startDate);
                        intern.setTrainingEndDate(endDate);

                        Intern savedIntern = internRepository.save(intern);
                        
                        // Create AuthUser record for new interns from API sync
                        if (isNewIntern) {
                            authRoleService.ensureAuthUserExists(savedIntern.getInternId());
                        }
                    }
                } else {
                    System.out.println("No trainees array found in API response");
                    statsService.setActiveInternsFromApi(0);
                }
            } else {
                System.err.println("Failed to sync interns: " + response.getStatusCode());
                statsService.setActiveInternsFromApi(0);
            }
        } catch (Exception e) {
            System.err.println("Error syncing interns from API: " + e.getMessage());
            e.printStackTrace();
            statsService.setActiveInternsFromApi(0);
        }
    }
    
    /**
     * Extract field value from JSON node, supporting both new and old field names
     */
    private String extractField(JsonNode node, String newFieldName, String oldFieldName) {
        if (node.has(newFieldName)) {
            return node.get(newFieldName).asText();
        } else if (node.has(oldFieldName)) {
            return node.get(oldFieldName).asText();
        }
        return null;
    }
    
    /**
     * Parse training date from JSON node, supporting both new ISO format and old format
     */
    private LocalDate parseTrainingDate(JsonNode node, String newFieldName, String oldFieldName, 
                                      DateTimeFormatter isoFormatter, DateTimeFormatter oldFormatter) {
        String dateString = extractField(node, newFieldName, oldFieldName);
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Try ISO format first (new format)
            return LocalDate.parse(dateString, isoFormatter);
        } catch (Exception e1) {
            try {
                // Try old format (M/d/yyyy) - extract date part if it has time component
                String datePart = dateString.split(" ")[0];
                return LocalDate.parse(datePart, oldFormatter);
            } catch (Exception e2) {
                System.err.println("Unable to parse date: " + dateString + ". Error: " + e2.getMessage());
                return null;
            }
        }
    }
}
