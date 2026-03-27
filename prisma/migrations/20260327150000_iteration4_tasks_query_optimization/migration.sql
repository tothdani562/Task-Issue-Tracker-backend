-- Drop now-redundant global filter indexes in favor of project-scoped indexes
DROP INDEX IF EXISTS "Task_status_idx";
DROP INDEX IF EXISTS "Task_priority_idx";

-- Add indexes optimized for project task listing filters and sorting
CREATE INDEX "Task_projectId_createdAt_idx" ON "Task"("projectId", "createdAt");
CREATE INDEX "Task_projectId_assignedUserId_idx" ON "Task"("projectId", "assignedUserId");
CREATE INDEX "Task_projectId_status_idx" ON "Task"("projectId", "status");
CREATE INDEX "Task_projectId_priority_idx" ON "Task"("projectId", "priority");
CREATE INDEX "Task_projectId_dueDate_idx" ON "Task"("projectId", "dueDate");
