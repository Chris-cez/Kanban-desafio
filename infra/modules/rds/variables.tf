variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the DB"
  type        = list(string)
}

variable "database_name" {
  description = "The name of the database to create"
  type        = string
  sensitive   = true
}

variable "database_user" {
  description = "The master username for the database"
  type        = string
  sensitive   = true
}

variable "database_password" {
  description = "The master password for the database"
  type        = string
  sensitive   = true
}