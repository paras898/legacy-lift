package com.legacybridge.model;

import java.util.List;

public class MigrationOutput {
    private String modernCode;
    private List<String> checklist;

    public MigrationOutput() {}

    public MigrationOutput(String modernCode, List<String> checklist) {
        this.modernCode = modernCode;
        this.checklist = checklist;
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
}

