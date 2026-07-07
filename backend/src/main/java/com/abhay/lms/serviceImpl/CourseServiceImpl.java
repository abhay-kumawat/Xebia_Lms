package com.abhay.lms.serviceImpl;

import com.abhay.lms.cache.RedisService;
import com.abhay.lms.dto.CourseRequestDTO;
import com.abhay.lms.dto.CourseResponseDTO;
import com.abhay.lms.entity.learning.CategoryEntity;
import com.abhay.lms.entity.learning.CourseEntity;
import com.abhay.lms.exception.ResourceNotFoundException;
import com.abhay.lms.mapper.CourseMapper;
import com.abhay.lms.repository.CategoryRepository;
import com.abhay.lms.repository.CourseRepository;
import com.abhay.lms.service.CourseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final RedisService redisService;

    public CourseServiceImpl(CourseRepository courseRepository, CategoryRepository categoryRepository, RedisService redisService) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.redisService = redisService;
    }

    @Override
    public CourseResponseDTO create(CourseRequestDTO request) {
        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        CourseEntity course = CourseMapper.toEntity(request, category);
        CourseEntity savedCourse = courseRepository.save(course);

        // Invalidate cache
        redisService.delete("courses_all");
        redisService.delete("category_courses_" + request.getCategoryId());

        return CourseMapper.toResponseDTO(savedCourse);
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<CourseResponseDTO> getAll() {
        String cacheKey = "courses_all";
        Object cached = redisService.get(cacheKey);
        if (cached instanceof List) {
            return (List<CourseResponseDTO>) cached;
        }

        List<CourseResponseDTO> result = courseRepository.findAll().stream()
                .map(course -> {
                    if (course.getCategory() != null) {
                        course.getCategory().getName();
                    }
                    return CourseMapper.toResponseDTO(course);
                })
                .collect(Collectors.toList());

        redisService.set(cacheKey, result, 30L);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponseDTO getById(Long id) {
        String cacheKey = "course_" + id;
        Object cached = redisService.get(cacheKey);
        if (cached instanceof CourseResponseDTO) {
            return (CourseResponseDTO) cached;
        }

        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        if (course.getModules() != null) {
            course.getModules().forEach(module -> {
                if (module.getSubmodules() != null) {
                    module.getSubmodules().forEach(submodule -> {
                        if (submodule.getContents() != null) {
                            submodule.getContents().size();
                        }
                    });
                }
            });
        }
        CourseResponseDTO result = CourseMapper.toResponseDTOWithModules(course);

        redisService.set(cacheKey, result, 30L);
        return result;
    }

    @Override
    public CourseResponseDTO update(Long id, CourseRequestDTO request) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        Long oldCategoryId = course.getCategory() != null ? course.getCategory().getId() : null;

        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        CourseMapper.updateEntity(course, request, category);
        CourseEntity updatedCourse = courseRepository.save(course);

        // Invalidate cache
        redisService.delete("courses_all");
        redisService.delete("course_" + id);
        redisService.delete("modules_course_" + id);
        if (oldCategoryId != null) {
            redisService.delete("category_courses_" + oldCategoryId);
        }
        redisService.delete("category_courses_" + request.getCategoryId());

        return CourseMapper.toResponseDTO(updatedCourse);
    }

    @Override
    public void delete(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        
        Long categoryId = course.getCategory() != null ? course.getCategory().getId() : null;

        courseRepository.delete(course);

        // Invalidate cache
        redisService.delete("courses_all");
        redisService.delete("course_" + id);
        redisService.delete("modules_course_" + id);
        if (categoryId != null) {
            redisService.delete("category_courses_" + categoryId);
        }
    }
}
