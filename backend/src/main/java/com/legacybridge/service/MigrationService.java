package com.legacybridge.service;

import com.legacybridge.model.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.client.RestTemplate;

@Service
public class MigrationService {

    private final Map<String, MigrationData> storage = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${google.ai.api.key}")
    private String apiKey;

    @Value("${google.ai.api.url:https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final List<Pattern> KNOWN_PATTERNS = Arrays.asList(
            new Pattern("GOD_CLASS", "Class attempting to handle too many responsibilities."),
            new Pattern("HARDCODED_CONFIG", "Connection strings or credentials found in source."),
            new Pattern("SPAGHETTI_LOGIC", "Complex control flow using GoTo or labels."),
            new Pattern("LEGACY_UI_MIX", "Business logic tightly coupled with UI components."),
            new Pattern("STALE_DB_CONN", "Direct unmanaged database connections (ADODB).")  
    );

    public AnalysisReport analyzeLegacyCode(String code) {
        String snippetId = "snip_" + UUID.randomUUID().toString().substring(0, 8);

        // Requirement #3: Hardcoded Rule Engine (Non-LLM)
        String riskLevel = classifyRiskDeterministic(code);

        // LLM Call for Summary and Patterns
        String prompt = "Analyze this legacy code and provide: 1. summary (plain English), 2. patterns (IDs matching [GOD_CLASS, HARDCODED_CONFIG, SPAGHETTI_LOGIC, LEGACY_UI_MIX, STALE_DB_CONN]). Return ONLY absolute JSON. Code: " + code;
        String llmResponse = callGemini(prompt);
        System.out.println("LLM Response: " + llmResponse);
    //    log.info("LLM Response: " + llmResponse);
        String summary = "Analysis failed";
        List<String> patterns = new ArrayList<>();

        try {
            // Remove potential markdown formatting from LLM response
            String cleanJson = llmResponse.replaceAll("(?s)```json\\s*(.*?)\\s*```", "$1")
                    .replaceAll("(?s)```\\s*(.*?)\\s*```", "$1")
                    .trim();

            // Basic check if it looks like JSON
            if (cleanJson.startsWith("{")) {
                JsonNode root = objectMapper.readTree(cleanJson);
                if (root.has("error")) {
                    summary = "LLM API error: " + root.path("error").asText(root.path("error").toString());
                } else {
                    summary = root.path("summary").asText("No summary provided");
                    JsonNode patternsNode = root.path("patterns");
                    if (patternsNode.isArray()) {
                        patternsNode.forEach(p -> patterns.add(p.asText()));
                    }
                }
            } else {
                summary = "LLM Response was not valid JSON: " + (cleanJson.length() > 100 ? cleanJson.substring(0, 100) + "..." : cleanJson);
            }
        } catch (Exception e) {
            summary = "Failed to parse LLM response: " + e.getMessage();
            e.printStackTrace();
        }

        AnalysisReport report = new AnalysisReport();
        report.setSnippetId(snippetId);
        report.setSummary(summary);
        report.setPatterns(patterns);
        report.setRisk(riskLevel);

        MigrationData data = new MigrationData();
        data.setId(snippetId);
        data.setLegacyCode(code);
        data.setAnalysis(report);
        storage.put(snippetId, data);

        return report;
    }

    private String callGemini(String prompt) {
        try {
            String url = apiUrl + "?key=" + apiKey;

            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String response;
            try {
                response = restTemplate.postForObject(url, entity, String.class);
            } catch (HttpClientErrorException e) {
                String errorMsg = "API Error: " + e.getStatusCode();
                String body = e.getResponseBodyAsString();
                if (body != null && !body.isBlank()) {
                    try {
                        JsonNode errorJson = objectMapper.readTree(body);
                        if (errorJson.has("error")) {
                            JsonNode error = errorJson.path("error");
                            errorMsg += " - " + error.path("message").asText(error.toString());
                        } else {
                            errorMsg += " - " + body;
                        }
                    } catch (Exception ignored) {
                        errorMsg += " - " + body;
                    }
                } else {
                    errorMsg += " - " + e.getMessage();
                }
                return objectMapper.createObjectNode().put("error", errorMsg).toString();
            } catch (RestClientException e) {
                return objectMapper.createObjectNode().put("error", "Request failed: " + e.getMessage()).toString();
            }

            if (response == null || response.trim().isEmpty()) {
                return objectMapper.createObjectNode().put("error", "Empty response from Gemini API").toString();
            }

            JsonNode responseJson = objectMapper.readTree(response);

            if (responseJson.has("error")) {
                JsonNode error = responseJson.path("error");
                String errorMsg;
                if (error.isObject()) {
                    errorMsg = error.path("message").asText(error.toString());
                } else {
                    errorMsg = error.asText("Unknown error");
                }
                return objectMapper.createObjectNode().put("error", errorMsg).toString();
            }

            JsonNode candidates = responseJson.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                return candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();
            }

            return objectMapper.createObjectNode().put("error", "No candidates in response").toString();
        } catch (Exception e) {
            return objectMapper.createObjectNode().put("error", e.getMessage()).toString();
        }
    }

    private String classifyRiskDeterministic(String code) {
        int score = 0;
        String lower = code.toLowerCase();

        if (lower.contains("adodb.connection")) score += 3;
        if (lower.contains("goto ")) score += 3;
        if (lower.contains("msgbox")) score += 2;
        if (lower.contains("connectionstring=")) score += 3;
        if (code.length() > 2000) score += 1;

        if (score >= 6) return "High";
        if (score >= 3) return "Medium";
        return "Low";
    }

    public MigrationOutput modernize(String snippetId) {
        MigrationData data = storage.get(snippetId);
        if (data == null) throw new RuntimeException("Snippet not found");

        String codePrompt = "Convert this legacy code to modern Java Spring Boot 3.x with comments and unit tests. Return ONLY the code block. Code: " + data.getLegacyCode();
        String modernCode = callGemini(codePrompt);

        String checklistPrompt = "Provide a JSON object with a 'tasks' array (strings) of migration actions for: " + data.getLegacyCode();
        String checklistJson = callGemini(checklistPrompt);
        List<String> tasks = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(checklistJson.replaceAll("```json|```", "").trim());
            JsonNode tasksNode = root.path("tasks");
            if (tasksNode.isArray()) {
                tasksNode.forEach(t -> tasks.add(t.asText()));
            }
        } catch (Exception e) {
            tasks.add("Review manual migration steps");
        }

        MigrationOutput output = new MigrationOutput();
        output.setModernCode(modernCode);
        output.setChecklist(tasks);

        data.setModernCode(modernCode);
        data.setChecklist(tasks);
        data.setMigrationComplete(true);

        return output;
    }

    public List<Pattern> getSupportedPatterns() {
        return KNOWN_PATTERNS;
    }

    public FullReport getReport(String snippetId) {
        MigrationData data = storage.get(snippetId);
        if (data == null) return null;

        Comparison comparison = new Comparison();
        comparison.setOld(data.getLegacyCode());
        comparison.setNext(data.getModernCode() != null ? data.getModernCode() : "Not modernised yet");

        FullReport fullReport = new FullReport();
        fullReport.setReportId(snippetId);
        fullReport.setAnalysis(data.getAnalysis());
        fullReport.setChecklist(data.getChecklist());
        fullReport.setComparison(comparison);
        return fullReport;
    }
}
