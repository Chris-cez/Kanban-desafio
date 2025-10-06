terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws" 
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  skip_credentials_validation = true
}

module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  vpc_cidr     = "10.0.0.0/16"
  aws_region   = var.aws_region
}

module "rds" {
  source = "./modules/rds"

  project_name                   = var.project_name
  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.public_subnet_ids
  database_name                  = var.database_name
  database_user                  = var.database_user
  database_password              = var.database_password
}

module "ecs" {
  source = "./modules/ecs"

  project_name              = var.project_name
  aws_region                = var.aws_region
  vpc_id                    = module.vpc.vpc_id
  public_subnet_ids         = module.vpc.public_subnet_ids
  default_security_group_id = module.vpc.default_security_group_id

  # Passa as saídas do módulo RDS como entrada para o módulo ECS
  database_host     = module.rds.db_instance_endpoint
  database_port     = module.rds.db_instance_port
  database_name     = module.rds.db_instance_name
  database_user     = module.rds.db_instance_username
  database_password = module.rds.db_instance_password
  jwt_secret        = var.jwt_secret
}

module "frontend" {
  source = "./modules/frontend"

  project_name = var.project_name
}

# Regra de Segurança Desacoplada para resolver a dependência circular
# Permite que o Security Group do ECS acesse o Security Group do RDS na porta do Postgres.
resource "aws_security_group_rule" "allow_ecs_to_rds" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = module.rds.rds_security_group_id
  source_security_group_id = module.ecs.ecs_instance_security_group_id
}
