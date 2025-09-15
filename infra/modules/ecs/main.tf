# 1. ECR - Repositório para a imagem Docker
resource "aws_ecr_repository" "main" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"
}

# 2. ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

# Log Group no CloudWatch para armazenar os logs do container
resource "aws_cloudwatch_log_group" "main" {
  name              = "/ecs/${var.project_name}-backend"
  retention_in_days = 7 # Mantém os logs por 7 dias
}

# 3. IAM - Permissões

# Role para a instância EC2 poder se comunicar com o ECS
resource "aws_iam_role" "ecs_instance_role" {
  name = "${var.project_name}-ecs-instance-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_instance_role_attachment" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "${var.project_name}-ecs-instance-profile"
  role = aws_iam_role.ecs_instance_role.name
}

# Role para a tarefa ECS poder baixar a imagem do ECR e enviar logs
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-ecs-task-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# 4. Security Groups (Firewall)

# SG para o Load Balancer: permite tráfego da internet na porta 80 (HTTP)
resource "aws_security_group" "lb_sg" {
  name        = "${var.project_name}-lb-sg"
  description = "Allow HTTP traffic to Load Balancer"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# SG para a instância EC2: permite tráfego apenas do Load Balancer
resource "aws_security_group" "ecs_instance_sg" {
  name        = "${var.project_name}-ecs-instance-sg"
  description = "Allow traffic from the LB to the ECS instances"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 0 # Permite qualquer porta
    to_port         = 0
    protocol        = "tcp"
    security_groups = [aws_security_group.lb_sg.id] # Apenas do nosso LB
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 5. Application Load Balancer (ALB)
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets            = var.public_subnet_ids
}

resource "aws_lb_target_group" "main" {
  name        = "${var.project_name}-tg"
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  health_check {
    path = "/health" # Endpoint de health check do seu app NestJS
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

# 6. EC2 (Nível Gratuito)

# Script para configurar a instância EC2 quando ela iniciar
data "template_file" "ecs_user_data" {
  template = <<-EOF
    #!/bin/bash
    echo ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config
  EOF
}

# Busca a imagem de máquina (AMI) mais recente otimizada para ECS
data "aws_ami" "ecs_optimized" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
}

resource "aws_launch_configuration" "main" {
  name_prefix                 = "${var.project_name}-lc-"
  image_id                    = data.aws_ami.ecs_optimized.id
  instance_type               = "t2.micro" # IMPORTANTE: Tipo de instância do nível gratuito
  security_groups             = [aws_security_group.ecs_instance_sg.id, var.default_security_group_id]
  iam_instance_profile        = aws_iam_instance_profile.ecs_instance_profile.name
  user_data                   = data.template_file.ecs_user_data.rendered
  associate_public_ip_address = true

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "main" {
  name                 = "${var.project_name}-asg"
  launch_configuration = aws_launch_configuration.main.name
  vpc_zone_identifier  = var.public_subnet_ids
  min_size             = 1
  max_size             = 1
  desired_capacity     = 1

  tag {
    key                 = "Name"
    value               = "${var.project_name}-ecs-instance"
    propagate_at_launch = true
  }
}

# 7. ECS Task Definition e Service

resource "aws_ecs_task_definition" "main" {
  family                   = "${var.project_name}-task"
  network_mode             = "bridge" # Modo de rede para EC2
  requires_compatibilities = ["EC2"]
  cpu                      = "256"  # 0.25 vCPU
  memory                   = "512"  # 512 MiB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name      = "${var.project_name}-container"
    image     = "${aws_ecr_repository.main.repository_url}:latest"
    cpu       = 256
    memory    = 512
    essential = true
    portMappings = [{
      containerPort = var.app_port
      hostPort      = 0 # Permite que o ECS escolha uma porta livre no host
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.main.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
    environment = [
      { name = "DATABASE_HOST", value = var.database_host },
      { name = "DATABASE_PORT", value = var.database_port },
      { name = "DATABASE_USER", value = var.database_user },
      { name = "DATABASE_PASSWORD", value = var.database_password },
      { name = "DATABASE_NAME", value = var.database_name },
      { name = "JWT_SECRET", value = var.jwt_secret },
      { name = "PORT", value = tostring(var.app_port) }
    ]
  }])
}

resource "aws_ecs_service" "main" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = 1
  launch_type     = "EC2"

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "${var.project_name}-container"
    container_port   = var.app_port
  }

  # Garante que o ALB esteja pronto antes de criar o serviço
  depends_on = [aws_lb_listener.http]
}