variable "project_name" {
  description = "The name of the project, used to prefix resource names."
  type        = string
  default     = "kanban-desafio"
}

variable "aws_region" {
  description = "The AWS region where resources will be created."
  type        = string
  default     = "us-east-1"
}

variable "database_name" {
  description = "The name for the RDS database."
  type        = string
  sensitive   = true
}

variable "database_user" {
  description = "The username for the RDS database."
  type        = string
  sensitive   = true
}

variable "database_password" {
  description = "The password for the RDS database."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "The secret key for JWT generation."
  type        = string
  sensitive   = true
}