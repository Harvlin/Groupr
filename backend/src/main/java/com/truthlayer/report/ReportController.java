package com.truthlayer.report;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.truthlayer.scoring.ScoringDtos;
import com.truthlayer.scoring.ScoringService;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects")
public class ReportController {
    private final ScoringService scoring;
    private final ObjectMapper mapper;
    public ReportController(ScoringService scoring, ObjectMapper mapper) { this.scoring = scoring; this.mapper = mapper; }

    @PostMapping("/{projectId}/report-exports")
    public ResponseEntity<String> export(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) {
        var report = scoring.teacherReport(UUID.fromString(jwt.getSubject()), projectId);
        var html = html(report);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, "text/html; charset=UTF-8").body(html);
    }

    @GetMapping("/{projectId}/teacher-report.html")
    public ResponseEntity<String> printable(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) {
        var report = scoring.teacherReport(UUID.fromString(jwt.getSubject()), projectId);
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html(report));
    }

    private String html(ScoringDtos.TeacherReportResponse report) {
        var rows = report.scores().stream().map(score -> "<tr><td>" + score.userId() + "</td><td>" + score.finalPercentage() + "%</td><td>" + score.confidenceLevel() + "</td><td>" + score.rationale().confidence_reason() + "</td></tr>").reduce("", String::concat);
        return "<!doctype html><html><head><meta charset=\"utf-8\"><title>Truth Layer report</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#0e0f0c}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}</style></head><body><h1>" + escape(report.project().name()) + "</h1><p>Evidence-based contribution report</p><table><thead><tr><th>Member</th><th>Score</th><th>Confidence</th><th>Rationale</th></tr></thead><tbody>" + rows + "</tbody></table></body></html>";
    }
    private String escape(String value) { return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;"); }
}
