package com.legacybridge.model;

import java.util.List;

public class MigrationData {
    private String id;
    private String legacyCode;
    private String modernCode;
    private List<String> checklist;
    private AnalysisReport analysis;
    private boolean migrationComplete;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLegacyCode() {
        return legacyCode;
    }

    public void setLegacyCode(String legacyCode) {
        this.legacyCode = legacyCode;
    }

    public String getModernCode() {
        return modernCode;
    }

    public void setModernCode(String modernCode) {
        this.modernCode = modernCode;
    }

    public List<String> getChecklist() {
        return checklist;
    }

    public void setChecklist(List<String> checklist) {
        this.checklist = checklist;
    }

    public AnalysisReport getAnalysis() {
        return analysis;
    }

    public void setAnalysis(AnalysisReport analysis) {
        this.analysis = analysis;
    }

    public boolean isMigrationComplete() {
        return migrationComplete;
    }

    public void setMigrationComplete(boolean migrationComplete) {
        this.migrationComplete = migrationComplete;
    }
}
