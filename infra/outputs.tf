output "frontend_url" {
  description = "The URL of the deployed frontend application."
  value       = "https://${module.frontend.cloudfront_distribution_domain_name}"
}

output "backend_url" {
  description = "The URL of the deployed backend API."
  value       = "http://${module.ecs.backend_url}"
}

output "ecr_repository_url" {
  description = "The URL of the ECR repository to push the backend image."
  value       = module.ecs.ecr_repository_url
}