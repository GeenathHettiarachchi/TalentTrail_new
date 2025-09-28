package com.internsystem.internmanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internsystem.internmanagement.dto.ContributorStatDTO;
import com.internsystem.internmanagement.dto.RepoAnalyticsDTO;
import com.internsystem.internmanagement.dto.SimpleCommitDTO;
import com.internsystem.internmanagement.entity.Project;
import com.internsystem.internmanagement.entity.RepoHost;
import com.internsystem.internmanagement.exception.ResourceNotFoundException;
import com.internsystem.internmanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RepoAnalyticsService {

    private final WebClient webClient;

    @Autowired
    private ProjectRepository projectRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public RepoAnalyticsService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public RepoAnalyticsDTO getAnalyticsForProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (project.getRepoHost() == null || project.getRepoName() == null) {
            return new RepoAnalyticsDTO(Collections.emptyList(), Collections.emptyList());
        }

        if (project.getRepoHost() == RepoHost.BITBUCKET) {
            return fetchBitbucketAnalytics(project.getRepoName(), project.getRepoAccessToken());
        } else if (project.getRepoHost() == RepoHost.GITHUB) {
            return fetchGithubAnalytics(project.getRepoName(), project.getRepoAccessToken());
        } else {
            return new RepoAnalyticsDTO(Collections.emptyList(), Collections.emptyList());
        }
    }

    private RepoAnalyticsDTO fetchBitbucketAnalytics(String repoSlug, String token) {
        // repoSlug expected as "workspace/repo"
        String[] parts = repoSlug.split("/");
        if (parts.length != 2) {
            return new RepoAnalyticsDTO(Collections.emptyList(), Collections.emptyList());
        }
        String workspace = parts[0];
        String repo = parts[1];

        // Fetch last 100 commits (for contributor stats) and latest 5 commits for recent
        JsonNode commitsNode = getBitbucketJson("https://api.bitbucket.org/2.0/repositories/" + workspace + "/" + repo + "/commits?pagelen=100", token);

        List<SimpleCommitDTO> recentCommits = new ArrayList<>();
        Map<String, Integer> counts = new HashMap<>();
        Map<String, String> displayNames = new HashMap<>();

        if (commitsNode != null && commitsNode.has("values")) {
            for (JsonNode c : commitsNode.get("values")) {
                String hash = c.path("hash").asText("");
                String message = c.path("message").asText("").split("\n")[0];
                String author = c.path("author").path("user").path("username").asText(
                        c.path("author").path("raw").asText("unknown")
                );
                String disp = c.path("author").path("user").path("display_name").asText(author);
                String dateStr = c.path("date").asText("");
                OffsetDateTime date = null;
                try { date = OffsetDateTime.parse(dateStr); } catch (Exception ignored) {}

                counts.merge(author, 1, Integer::sum);
                displayNames.putIfAbsent(author, disp);

                if (recentCommits.size() < 5) {
                    recentCommits.add(new SimpleCommitDTO(shortHash(hash), message, author, date));
                }
            }
        }

        List<ContributorStatDTO> contributors = counts.entrySet().stream()
                .map(e -> new ContributorStatDTO(e.getKey(), displayNames.getOrDefault(e.getKey(), e.getKey()), e.getValue()))
                .sorted(Comparator.comparingInt(ContributorStatDTO::getCommitCount).reversed())
                .collect(Collectors.toList());

        return new RepoAnalyticsDTO(contributors, recentCommits);
    }

    private String shortHash(String hash) {
        if (hash == null) return "";
        return hash.length() > 7 ? hash.substring(0, 7) : hash;
    }

    // Uses Bitbucket Repository Access Token (per-repo) via Bearer authorization when provided.
    // If token is absent/blank, no Authorization header is sent (works for public repos).
    private JsonNode getBitbucketJson(String url, String token) {
        try {
            String json = webClient.get()
                    .uri(url)
                    .headers(h -> {
                        if (token != null && !token.isBlank()) {
                            h.setBearerAuth(token.trim());
                        }
                    })
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorResume(ex -> Mono.empty())
                    .blockOptional()
                    .orElse(null);
            if (json == null) return null;
            return objectMapper.readTree(json);
        } catch (Exception e) {
            return null;
        }
    }

    private RepoAnalyticsDTO fetchGithubAnalytics(String repoSlug, String token) {
        // repoSlug expected as "owner/repo"
        String[] parts = repoSlug.split("/");
        if (parts.length != 2) {
            return new RepoAnalyticsDTO(Collections.emptyList(), Collections.emptyList());
        }
        String owner = parts[0];
        String repo = parts[1];

        JsonNode commitsNode = getGithubJson("https://api.github.com/repos/" + owner + "/" + repo + "/commits?per_page=100", token);

        List<SimpleCommitDTO> recentCommits = new ArrayList<>();
        Map<String, Integer> counts = new HashMap<>();
        Map<String, String> displayNames = new HashMap<>();

        if (commitsNode != null && commitsNode.isArray()) {
            for (JsonNode c : commitsNode) {
                String sha = c.path("sha").asText("");
                String message = c.path("commit").path("message").asText("").split("\n")[0];
                String login = c.path("author").path("login").asText("");
                String name = c.path("commit").path("author").path("name").asText(login);
                String author = login != null && !login.isBlank() ? login : name;
                String dateStr = c.path("commit").path("author").path("date").asText("");
                java.time.OffsetDateTime date = null;
                try { date = java.time.OffsetDateTime.parse(dateStr); } catch (Exception ignored) {}

                counts.merge(author, 1, Integer::sum);
                displayNames.putIfAbsent(author, name);

                if (recentCommits.size() < 5) {
                    recentCommits.add(new SimpleCommitDTO(shortHash(sha), message, author, date));
                }
            }
        }

        List<ContributorStatDTO> contributors = counts.entrySet().stream()
                .map(e -> new ContributorStatDTO(e.getKey(), displayNames.getOrDefault(e.getKey(), e.getKey()), e.getValue()))
                .sorted(Comparator.comparingInt(ContributorStatDTO::getCommitCount).reversed())
                .collect(Collectors.toList());

        return new RepoAnalyticsDTO(contributors, recentCommits);
    }

    private JsonNode getGithubJson(String url, String token) {
        try {
            String json = webClient.get()
                    .uri(url)
                    .headers(h -> {
                        h.set("Accept", "application/vnd.github+json");
                        h.set("User-Agent", "intern-management-app");
                        if (token != null && !token.isBlank()) {
                            // GitHub fine-grained PAT uses the 'token' scheme
                            h.set("Authorization", "token " + token.trim());
                        }
                    })
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorResume(ex -> Mono.empty())
                    .blockOptional()
                    .orElse(null);
            if (json == null) return null;
            return objectMapper.readTree(json);
        } catch (Exception e) {
            return null;
        }
    }
}
