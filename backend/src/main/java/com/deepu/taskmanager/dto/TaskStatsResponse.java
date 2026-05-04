package com.deepu.taskmanager.dto;

public class TaskStatsResponse {
    private long totalTasks;
    private long todoCount;
    private long inProgressCount;
    private long doneCount;

    public TaskStatsResponse(long totalTasks, long todoCount, long inProgressCount, long doneCount) {
        this.totalTasks = totalTasks;
        this.todoCount = todoCount;
        this.inProgressCount = inProgressCount;
        this.doneCount = doneCount;
    }

    // Getters
    public long getTotalTasks() { return totalTasks; }
    public long getTodoCount() { return todoCount; }
    public long getInProgressCount() { return inProgressCount; }
    public long getDoneCount() { return doneCount; }
}
