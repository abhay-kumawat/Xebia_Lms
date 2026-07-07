package com.abhay.lms.entity.learning;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 200)
    private String course;

    @Column(nullable = false)
    @Builder.Default
    private Integer durationMinutes = 30;

    @Column(nullable = false)
    @Builder.Default
    private Integer passingPercent = 60;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalMarks = 0;

    @Column(length = 50)
    private String dueDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<QuizQuestionEntity> questions = new ArrayList<>();
}
