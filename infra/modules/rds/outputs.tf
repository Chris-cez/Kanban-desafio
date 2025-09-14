output "db_instance_endpoint" {
  description = "The connection endpoint for the database instance"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_port" {
  description = "The port for the database instance"
  value       = aws_db_instance.main.port
}

output "db_instance_name" {
  description = "The name of the database"
  value       = aws_db_instance.main.db_name
  sensitive   = true
}

output "db_instance_username" {
  description = "The master username for the database"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "db_instance_password" {
  description = "The master password for the database"
  value       = aws_db_instance.main.password
  sensitive   = true
}

output "rds_security_group_id" {
  description = "The ID of the security group for the RDS instance"
  value       = aws_security_group.rds_sg.id
}