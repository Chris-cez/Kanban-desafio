resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

resource "aws_security_group" "default" {
  name        = "${var.project_name}-default-sg"
  description = "Default security group"
  vpc_id      = aws_vpc.main.id
}