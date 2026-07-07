package com.abhay.lms.controller;

import com.abhay.lms.entity.learning.QuizEntity;
import com.abhay.lms.entity.learning.QuizQuestionEntity;
import com.abhay.lms.repository.QuizRepository;
import com.abhay.lms.repository.QuizQuestionRepository;
import com.abhay.lms.response.ApiResponse;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;

    public QuizController(QuizRepository quizRepository, QuizQuestionRepository quizQuestionRepository) {
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
    }

    // ─── DTOs ──────────────────────────────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class QuizCreateRequest {
        private String title;
        private String course;
        private Integer durationMinutes;
        private Integer passingPercent;
        private Integer totalMarks;
        private String dueDate;
        private List<QuestionDTO> questions;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class QuestionDTO {
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctAnswer;
        private Integer marks;
        private String explanation;
    }

    // ─── REST ENDPOINTS ────────────────────────────────────────────────────────

    /** GET /api/quizzes - List all quizzes (newest first) */
    @GetMapping
    public ResponseEntity<ApiResponse> getAllQuizzes() {
        List<QuizEntity> quizzes = quizRepository.findAllByOrderByCreatedAtDesc();
        Map<String, Object> data = new HashMap<>();
        data.put("quizzes", quizzes.stream().map(q -> {
            Map<String, Object> quiz = new HashMap<>();
            quiz.put("id", q.getId());
            quiz.put("title", q.getTitle());
            quiz.put("course", q.getCourse());
            quiz.put("durationMinutes", q.getDurationMinutes());
            quiz.put("passingPercent", q.getPassingPercent());
            quiz.put("totalMarks", q.getTotalMarks());
            quiz.put("dueDate", q.getDueDate());
            quiz.put("questionsCount", q.getQuestions().size());
            quiz.put("createdAt", q.getCreatedAt());
            return quiz;
        }).toList());
        data.put("total", quizzes.size());
        return ResponseEntity.ok(new ApiResponse("Quizzes retrieved successfully", data));
    }

    /** GET /api/quizzes/{id} - Get quiz with all questions */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getQuizById(@PathVariable Long id) {
        return quizRepository.findById(id).map(quiz -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", quiz.getId());
            data.put("title", quiz.getTitle());
            data.put("course", quiz.getCourse());
            data.put("durationMinutes", quiz.getDurationMinutes());
            data.put("passingPercent", quiz.getPassingPercent());
            data.put("totalMarks", quiz.getTotalMarks());
            data.put("dueDate", quiz.getDueDate());
            data.put("createdAt", quiz.getCreatedAt());
            data.put("questions", quizQuestionRepository.findByQuizId(quiz.getId()));
            return ResponseEntity.ok(new ApiResponse("Quiz retrieved successfully", data));
        }).orElseGet(() -> new ResponseEntity<>(
                new ApiResponse("Quiz not found", null), HttpStatus.NOT_FOUND));
    }

    /** POST /api/quizzes - Create quiz from JSON payload (sent by ImportQuizFromExcel frontend) */
    @PostMapping
    public ResponseEntity<ApiResponse> createQuiz(@RequestBody QuizCreateRequest request) {
        try {
            // Validate
            if (request.getTitle() == null || request.getTitle().isBlank()) {
                return new ResponseEntity<>(new ApiResponse("Quiz title is required", null), HttpStatus.BAD_REQUEST);
            }
            if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
                return new ResponseEntity<>(new ApiResponse("At least one question is required", null), HttpStatus.BAD_REQUEST);
            }

            int totalMarks = request.getQuestions().stream()
                    .mapToInt(q -> q.getMarks() != null ? q.getMarks() : 1)
                    .sum();

            // Save quiz
            QuizEntity quiz = QuizEntity.builder()
                    .title(request.getTitle().trim())
                    .course(request.getCourse())
                    .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 30)
                    .passingPercent(request.getPassingPercent() != null ? request.getPassingPercent() : 60)
                    .totalMarks(totalMarks)
                    .dueDate(request.getDueDate())
                    .build();
            quizRepository.save(quiz);

            // Save questions
            List<QuizQuestionEntity> saved = new ArrayList<>();
            for (QuestionDTO dto : request.getQuestions()) {
                QuizQuestionEntity q = QuizQuestionEntity.builder()
                        .quiz(quiz)
                        .question(dto.getQuestion())
                        .optionA(dto.getOptionA())
                        .optionB(dto.getOptionB())
                        .optionC(dto.getOptionC())
                        .optionD(dto.getOptionD())
                        .correctAnswer(dto.getCorrectAnswer() != null ? dto.getCorrectAnswer().toUpperCase() : "A")
                        .marks(dto.getMarks() != null ? dto.getMarks() : 1)
                        .explanation(dto.getExplanation())
                        .build();
                saved.add(quizQuestionRepository.save(q));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("quizId", quiz.getId());
            response.put("title", quiz.getTitle());
            response.put("questionsCount", saved.size());
            response.put("totalMarks", totalMarks);

            return new ResponseEntity<>(new ApiResponse("Quiz created successfully with " + saved.size() + " questions", response), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse("Failed to create quiz: " + e.getMessage(), null), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /** POST /api/quizzes/import-excel - Directly upload an .xlsx file and parse server-side */
    @PostMapping(value = "/import-excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> importFromExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "course", required = false) String course,
            @RequestParam(value = "durationMinutes", defaultValue = "30") Integer durationMinutes,
            @RequestParam(value = "passingPercent", defaultValue = "60") Integer passingPercent,
            @RequestParam(value = "dueDate", required = false) String dueDate
    ) {
        if (file.isEmpty()) {
            return new ResponseEntity<>(new ApiResponse("File is empty", null), HttpStatus.BAD_REQUEST);
        }
        String filename = Objects.requireNonNull(file.getOriginalFilename()).toLowerCase();
        if (!filename.endsWith(".xlsx") && !filename.endsWith(".xls")) {
            return new ResponseEntity<>(new ApiResponse("Only .xlsx and .xls files are supported", null), HttpStatus.BAD_REQUEST);
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIter = sheet.iterator();

            if (!rowIter.hasNext()) {
                return new ResponseEntity<>(new ApiResponse("Excel file is empty", null), HttpStatus.BAD_REQUEST);
            }

            // Read header row - build column index map
            Row header = rowIter.next();
            Map<String, Integer> colIndex = new HashMap<>();
            for (Cell cell : header) {
                colIndex.put(getCellString(cell).trim(), cell.getColumnIndex());
            }

            // Validate required columns
            List<String> requiredCols = List.of("Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer");
            List<String> missing = requiredCols.stream().filter(c -> !colIndex.containsKey(c)).toList();
            if (!missing.isEmpty()) {
                return new ResponseEntity<>(new ApiResponse("Missing required columns: " + missing, null), HttpStatus.BAD_REQUEST);
            }

            // Parse questions
            List<QuestionDTO> questions = new ArrayList<>();
            List<String> parseErrors = new ArrayList<>();
            int rowNum = 2;

            while (rowIter.hasNext()) {
                Row row = rowIter.next();
                String question = getCellAt(row, colIndex.get("Question"));
                String optA    = getCellAt(row, colIndex.get("Option A"));
                String optB    = getCellAt(row, colIndex.get("Option B"));
                String optC    = getCellAt(row, colIndex.get("Option C"));
                String optD    = getCellAt(row, colIndex.get("Option D"));
                String correct = getCellAt(row, colIndex.get("Correct Answer")).toUpperCase();
                Integer marksVal = 1;
                Integer marksIdx = colIndex.get("Marks");
                if (marksIdx != null) {
                    String marksStr = getCellAt(row, marksIdx);
                    try { marksVal = (int) Double.parseDouble(marksStr); } catch (Exception ignored) {}
                }
                String explanation = "";
                Integer explIdx = colIndex.get("Explanation");
                if (explIdx != null) explanation = getCellAt(row, explIdx);

                if (question.isBlank()) { rowNum++; continue; }
                if (!List.of("A","B","C","D").contains(correct)) {
                    parseErrors.add("Row " + rowNum + ": Correct Answer must be A, B, C, or D");
                    rowNum++; continue;
                }

                QuestionDTO dto = new QuestionDTO();
                dto.setQuestion(question);
                dto.setOptionA(optA);
                dto.setOptionB(optB);
                dto.setOptionC(optC);
                dto.setOptionD(optD);
                dto.setCorrectAnswer(correct);
                dto.setMarks(marksVal);
                dto.setExplanation(explanation);
                questions.add(dto);
                rowNum++;
            }

            if (questions.isEmpty()) {
                return new ResponseEntity<>(new ApiResponse("No valid questions found in file", null), HttpStatus.BAD_REQUEST);
            }

            // Build and save quiz
            QuizCreateRequest req = new QuizCreateRequest();
            req.setTitle(title);
            req.setCourse(course);
            req.setDurationMinutes(durationMinutes);
            req.setPassingPercent(passingPercent);
            req.setDueDate(dueDate);
            req.setQuestions(questions);

            return createQuiz(req);

        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse("Failed to parse Excel: " + e.getMessage(), null), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /** DELETE /api/quizzes/{id} - Delete a quiz and all its questions */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteQuiz(@PathVariable Long id) {
        return quizRepository.findById(id).map(quiz -> {
            quizRepository.delete(quiz);
            return ResponseEntity.ok(new ApiResponse("Quiz deleted successfully", null));
        }).orElseGet(() -> new ResponseEntity<>(new ApiResponse("Quiz not found", null), HttpStatus.NOT_FOUND));
    }

    /** GET /api/quizzes/template/download - Download sample .xlsx template */
    @GetMapping("/template/download")
    public ResponseEntity<byte[]> downloadTemplate() {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Quiz Questions");

            // Header
            String[] headers = {"Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Marks", "Explanation"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Sample rows
            Object[][] samples = {
                {"What is a Docker container?", "A virtual machine", "A lightweight runtime environment", "A database engine", "A cloud service", "B", 5, "Containers bundle apps with dependencies for consistent portability."},
                {"Which keyword defines a class in Java?", "object", "define", "class", "struct", "C", 5, "The 'class' keyword is used in Java to define a class."},
                {"What does REST stand for?", "Representational State Transfer", "Remote Execution Shell Transfer", "Real-time Event Streaming Tool", "Recursive State Tree", "A", 5, ""},
            };
            for (int r = 0; r < samples.length; r++) {
                Row row = sheet.createRow(r + 1);
                for (int c = 0; c < samples[r].length; c++) {
                    Cell cell = row.createCell(c);
                    if (samples[r][c] instanceof Number) {
                        cell.setCellValue(((Number) samples[r][c]).doubleValue());
                    } else {
                        cell.setCellValue(samples[r][c] != null ? samples[r][c].toString() : "");
                    }
                }
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            byte[] bytes = out.toByteArray();

            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            httpHeaders.setContentDispositionFormData("attachment", "quiz_template.xlsx");
            return new ResponseEntity<>(bytes, httpHeaders, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────────

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default      -> "";
        };
    }

    private String getCellAt(Row row, int colIdx) {
        Cell cell = row.getCell(colIdx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        return getCellString(cell).trim();
    }
}
