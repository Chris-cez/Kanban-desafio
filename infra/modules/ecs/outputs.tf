output "ecr_repository_url" {
  description = "The URL of the ECR repository"
  value       = aws_ecr_repository.main.repository_url
}

output "ecr_repository_name" {
  description = "The name of the ECR repository"
  value       = aws_ecr_repository.main.name
}

output "backend_url" {
  description = "The URL of the backend service"
  value       = aws_lb.main.dns_name
}

output "ecs_instance_security_group_id" {
  description = "The ID of the security group for the ECS instances"
  value       = aws_security_group.ecs_instance_sg.id
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "The name of the ECS service"
  value       = aws_ecs_service.main.name
}