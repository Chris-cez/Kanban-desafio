terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1" # Ou sua região de preferência
}

module "vpc" {
  source = "./modules/vpc"

  project_name = "kanban-desafio"
  vpc_cidr     = "10.0.0.0/16"
}
