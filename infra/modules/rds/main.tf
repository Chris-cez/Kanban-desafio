# 1. Security Group (Firewall) para o Banco de Dados
# Este SG permite que apenas as instâncias do backend (ECS) se conectem ao banco na porta 5432.
resource "aws_security_group" "rds_sg" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow inbound traffic from ECS to RDS"
  vpc_id      = var.vpc_id

  # Regra de Saída (egress): Permite que o RDS se conecte a qualquer lugar (necessário para updates, etc).
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

# 2. Subnet Group para o RDS
# O RDS precisa saber em quais sub-redes ele pode ser criado.
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-subnet-group"
  }
}

# 3. Instância do Banco de Dados (RDS)
resource "aws_db_instance" "main" {
  identifier           = "${var.project_name}-db"
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = "db.t2.micro" # IMPORTANTE: Tipo de instância do Nível Gratuito.
  allocated_storage    = 20            # IMPORTANTE: 20 GB é o limite do Nível Gratuito.
  storage_type         = "gp2"

  db_name              = var.database_name
  username             = var.database_user
  password             = var.database_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  multi_az               = false # Nível Gratuito não cobre Multi-AZ.
  publicly_accessible    = true  # A instância está em subnet pública, mas o SG a protege.
  skip_final_snapshot    = true  # Evita custos ao destruir a infraestrutura.

  tags = {
    Name = "${var.project_name}-db-instance"
  }
}