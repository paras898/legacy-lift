package com.legacybridge.controller;

import com.legacybridge.service.MigrationService;
import com.legacybridge.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MigrationController {

    @Autowired
    private MigrationService migrationService;

    /**
     * Requirement #1 & #2: Submit legacy snippet for analysis
     */
    @PostMapping("/analyze")
    public ResponseEntity<AnalysisReport> analyze(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        AnalysisReport report = migrationService.analyzeLegacyCode(code);
        return ResponseEntity.ok(report);
    }

    /**
     * Requirement #4 & #5: Generate modern Spring Boot code + Checklist
     */
    @PostMapping("/migrate/{snippetId}")
    public ResponseEntity<MigrationOutput> migrate(@PathVariable String snippetId) {
        MigrationOutput output = migrationService.modernize(snippetId);
        return ResponseEntity.ok(output);
    }

    /**
     * Requirement #6: Get full migration report
     */
    @GetMapping("/report/{snippetId}")
    public ResponseEntity<FullReport> getReport(@PathVariable String snippetId) {
        FullReport report = migrationService.getReport(snippetId);
        return ResponseEntity.ok(report);
    }

    /**
     * Requirement #7: Get supported patterns
     */
    @GetMapping("/patterns")
    public ResponseEntity<List<Pattern>> getPatterns() {
        return ResponseEntity.ok(migrationService.getSupportedPatterns());
    }
}
