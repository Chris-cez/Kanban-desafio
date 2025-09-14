variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "aws_region" {
  description = "The AWS region"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "default_security_group_id" {
  description = "ID of the default security group"
  type        = string
}

variable "app_port" {
  description = "Port exposed by the application container"
  type        = number
  default     = 3000
}

# ATENÇÃO: Estas variáveis são para as credenciais.
# Em um projeto real, use o AWS Secrets Manager.
# Por agora, vamos passar via terminal para não deixá-las no código.
variable "database_host" { type = string; sensitive = true }
variable "database_port" { type = string; sensitive = true }
variable "database_user" { type = string; sensitive = true }
variable "database_password" { type = string; sensitive = true }
variable "database_name" { type = string; sensitive = true }
variable "jwt_secret" { type = string; sensitive = true }