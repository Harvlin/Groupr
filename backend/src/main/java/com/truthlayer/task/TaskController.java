package com.truthlayer.task;

import com.truthlayer.project.ProjectService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class TaskService {
    private final TaskRepository tasks;
    private final ProjectService projects;
    TaskService(TaskRepository tasks, ProjectService projects) { this.tasks = tasks; this.projects = projects; }
    @Transactional(readOnly = true) java.util.List<TaskDtos.Response> list(UUID userId, UUID projectId) { projects.get(userId, projectId); return tasks.findByProjectIdOrderByCreatedAtDesc(projectId).stream().map(this::response).toList(); }
    @Transactional TaskDtos.Response create(UUID userId, UUID projectId, TaskDtos.CreateRequest request) { var members = projects.listMembers(userId, projectId); var member = members.stream().filter(value -> value.userId().equals(userId)).findFirst().orElseThrow(() -> new SecurityException("Project membership required")); var task = tasks.save(new TaskEntity(projectId, request.title(), request.description(), request.assignedToMemberId(), member.id(), request.dueDate(), request.fromCoachSuggestion())); return response(task); }
    @Transactional TaskDtos.Response update(UUID userId, UUID taskId, TaskDtos.StatusRequest request) { var task = tasks.findById(taskId).orElseThrow(() -> new IllegalArgumentException("Task not found")); projects.get(userId, task.getProjectId()); try { task.updateStatus(TaskEntity.Status.valueOf(request.status().toUpperCase())); } catch (IllegalArgumentException exception) { throw new IllegalArgumentException("status must be open, in_progress, or done"); } return response(task); }
    @Transactional void delete(UUID userId, UUID taskId) { var task = tasks.findById(taskId).orElseThrow(() -> new IllegalArgumentException("Task not found")); projects.get(userId, task.getProjectId()); tasks.delete(task); }
    private TaskDtos.Response response(TaskEntity task) { return new TaskDtos.Response(task.getId(), task.getProjectId(), task.getTitle(), task.getDescription(), task.getAssignedToMemberId(), task.getStatus().name().toLowerCase(), task.getCreatedByMemberId(), task.getCreatedAt(), task.getDueDate(), task.isFromCoachSuggestion()); }
}

@RestController
@RequestMapping("/api/v1")
public class TaskController {
    private final TaskService tasks;
    public TaskController(TaskService tasks) { this.tasks = tasks; }
    @GetMapping("/projects/{projectId}/tasks") public Object list(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId) { return tasks.list(userId(jwt), projectId); }
    @PostMapping("/projects/{projectId}/tasks") @ResponseStatus(HttpStatus.CREATED) public TaskDtos.Response create(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID projectId, @Valid @RequestBody TaskDtos.CreateRequest request) { return tasks.create(userId(jwt), projectId, request); }
    @PatchMapping("/tasks/{taskId}") public TaskDtos.Response update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId, @RequestBody TaskDtos.StatusRequest request) { return tasks.update(userId(jwt), taskId, request); }
    @DeleteMapping("/tasks/{taskId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID taskId) { tasks.delete(userId(jwt), taskId); }
    private UUID userId(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }
}
