package com.legacybridge.model;

import java.util.List;

public class FullReport {
    private String reportId;
    private Comparison comparison;
    private AnalysisReport analysis;
    private List<String> checklist;

    public FullReport() {}

    public FullReport(String reportId, Comparison comparison, AnalysisReport analysis, List<String> checklist) {
        this.reportId = reportId;
        this.comparison = comparison;
        this.analysis = analysis;
        this.checklist = checklist;
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public Comparison getComparison() {
        return comparison;
    }

    public void setComparison(Comparison comparison) {
        this.comparison = comparison;
    }

    public AnalysisReport getAnalysis() {
        return analysis;
    }

    public void setAnalysis(AnalysisReport analysis) {
        this.analysis = analysis;
    }

    public List<String> getChecklist() {
        return checklist;
    }

    public void setChecklist(List<String> checklist) {
        this.checklist = checklist;
    }
}
