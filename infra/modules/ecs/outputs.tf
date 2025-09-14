output "ecr_repository_url" {
  description = "The URL of the ECR repository"
  value       = aws_ecr_repository.main.repository_url
}

output "backend_url" {
  description = "The URL of the backend service"
  value       = aws_lb.main.dns_name
}

output "ecs_instance_security_group_id" {
  description = "The ID of the security group for the ECS instances"
  value       = aws_security_group.ecs_instance_sg.id
}