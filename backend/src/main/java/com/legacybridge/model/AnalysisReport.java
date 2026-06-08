package com.legacybridge.model;

import java.util.List;

public class AnalysisReport {
    private String snippetId;
    private String summary;
    private List<String> patterns;
    private String risk;

    public AnalysisReport() {}

    public AnalysisReport(String snippetId, String summary, List<String> patterns, String risk) {
        this.snippetId = snippetId;
        this.summary = summary;
        this.patterns = patterns;
        this.risk = risk;
    }

    public String getSnippetId() {
        return snippetId;
    }

    public void setSnippetId(String snippetId) {
        this.snippetId = snippetId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getPatterns() {
        return patterns;
    }

    public void setPatterns(List<String> patterns) {
        this.patterns = patterns;
    }

    public String getRisk() {
        return risk;
    }

    public void setRisk(String risk) {
        this.risk = risk;
    }
}
