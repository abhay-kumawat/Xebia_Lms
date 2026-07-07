package com.abhay.lms.controller;

import com.abhay.lms.entity.learning.AssessmentEntity;
import com.abhay.lms.entity.learning.SubmissionEntity;
import com.abhay.lms.repository.AssessmentRepository;
import com.abhay.lms.repository.SubmissionRepository;
import com.abhay.lms.response.ApiResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentRepository assessmentRepository;
    private final SubmissionRepository submissionRepository;

    public AssessmentController(AssessmentRepository assessmentRepository, SubmissionRepository submissionRepository) {
        this.assessmentRepository = assessmentRepository;
        this.submissionRepository = submissionRepository;
    }

    @PostConstruct
    public void seedData() {
        try {
            if (assessmentRepository.count() == 0) {
                assessmentRepository.save(AssessmentEntity.builder()
                        .title("GenAI Core Concepts")
                        .type("Quiz")
                        .course("Generative AI Foundations")
                        .totalPoints(100)
                        .questionsCount(10)
                        .dueDate("2026-07-15")
                        .build());
                assessmentRepository.save(AssessmentEntity.builder()
                        .title("Docker Container Lifecycle")
                        .type("Quiz")
                        .course("Docker & Kubernetes Mastery")
                        .totalPoints(100)
                        .questionsCount(10)
                        .dueDate("2026-07-20")
                        .build());
                assessmentRepository.save(AssessmentEntity.builder()
                        .title("Spring Boot REST Endpoints")
                        .type("Assignment")
                        .course("Spring Boot Enterprise APIs")
                        .totalPoints(100)
                        .questionsCount(1)
                        .dueDate("2026-07-18")
                        .build());
                assessmentRepository.save(AssessmentEntity.builder()
                        .title("Data Science DataFrame Ops")
                        .type("Quiz")
                        .course("Data Science with Pandas")
                        .totalPoints(50)
                        .questionsCount(5)
                        .dueDate("2026-07-12")
                        .build());
            }

            if (submissionRepository.count() == 0) {
                submissionRepository.save(SubmissionEntity.builder()
                        .studentName("Abhay Kumawat")
                        .enrollmentNo("XEB-2026-081")
                        .email("abhay.kumawat@xebia.com")
                        .assessmentTitle("Docker Container Lifecycle")
                        .type("Quiz")
                        .submittedDate("2026-07-07")
                        .status("Graded")
                        .score(92)
                        .build());
                submissionRepository.save(SubmissionEntity.builder()
                        .studentName("Neha Patel")
                        .enrollmentNo("XEB-2026-112")
                        .email("neha.patel@xebia.com")
                        .assessmentTitle("Docker Container Lifecycle")
                        .type("Quiz")
                        .submittedDate("2026-07-06")
                        .status("Graded")
                        .score(87)
                        .build());
                submissionRepository.save(SubmissionEntity.builder()
                        .studentName("Aarav Sharma")
                        .enrollmentNo("XEB-2026-095")
                        .email("aarav.sharma@xebia.com")
                        .assessmentTitle("Docker Container Lifecycle")
                        .type("Quiz")
                        .submittedDate("2026-07-06")
                        .status("Graded")
                        .score(82)
                        .build());
                submissionRepository.save(SubmissionEntity.builder()
                        .studentName("Abhay Kumawat")
                        .enrollmentNo("XEB-2026-081")
                        .email("abhay.kumawat@xebia.com")
                        .assessmentTitle("Spring Boot REST Endpoints")
                        .type("Assignment")
                        .submittedDate("2026-07-07")
                        .status("Pending Evaluation")
                        .score(null)
                        .build());
                submissionRepository.save(SubmissionEntity.builder()
                        .studentName("Rohan Das")
                        .enrollmentNo("XEB-2026-204")
                        .email("rohan.das@xebia.com")
                        .assessmentTitle("Spring Boot REST Endpoints")
                        .type("Assignment")
                        .submittedDate("2026-07-05")
                        .status("Graded")
                        .score(88)
                        .build());
            }
        } catch (Exception e) {
            System.err.println("Error seeding assessment/submission data: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllAssessments() {
        List<AssessmentEntity> assessments = assessmentRepository.findAll();
        return ResponseEntity.ok(new ApiResponse("Assessments retrieved successfully", assessments));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createAssessment(@RequestBody AssessmentEntity assessment) {
        AssessmentEntity saved = assessmentRepository.save(assessment);
        return new ResponseEntity<>(new ApiResponse("Assessment created successfully", saved), HttpStatus.CREATED);
    }

    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse> getAllSubmissions() {
        List<SubmissionEntity> submissions = submissionRepository.findAll();
        return ResponseEntity.ok(new ApiResponse("Submissions retrieved successfully", submissions));
    }

    @PutMapping("/submissions/{id}/grade")
    public ResponseEntity<ApiResponse> gradeSubmission(@PathVariable Long id, @RequestParam Integer score) {
        return submissionRepository.findById(id).map(sub -> {
            sub.setScore(score);
            sub.setStatus("Graded");
            SubmissionEntity saved = submissionRepository.save(sub);
            return ResponseEntity.ok(new ApiResponse("Submission graded successfully", saved));
        }).orElseGet(() -> new ResponseEntity<>(new ApiResponse("Submission not found", null), HttpStatus.NOT_FOUND));
    }
}
