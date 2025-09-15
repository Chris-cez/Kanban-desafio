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

output "ecr_repository_name" {
  description = "The name of the ECR repository for the backend image."
  value       = module.ecs.ecr_repository_name
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster."
  value       = module.ecs.ecs_cluster_name
}

output "ecs_service_name" {
  description = "The name of the ECS service."
  value       = module.ecs.ecs_service_name
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket for the frontend."
  value       = module.frontend.s3_bucket_id
}

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution for the frontend."
  value       = module.frontend.cloudfront_distribution_id
}