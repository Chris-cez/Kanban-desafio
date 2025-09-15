# Documentação da Infraestrutura (IaC com Terraform)

Este diretório contém todo o código de Infraestrutura como Código (IaC) usando Terraform para provisionar os recursos necessários na AWS para a aplicação Kanban.

A estrutura é modular, visando a reutilização e a clareza.

## Estrutura dos Módulos

A infraestrutura é dividida nos seguintes módulos:

### 1. Módulo `vpc`

- **Propósito:** Cria a fundação de rede isolada para a aplicação.
- **Recursos Principais:**
  - `aws_vpc`: A Virtual Private Cloud (VPC) principal.
  - `aws_subnet`: Duas sub-redes públicas em zonas de disponibilidade diferentes (`us-east-1a`, `us-east-1b`), essenciais para a alta disponibilidade de serviços como o Application Load Balancer.
  - `aws_internet_gateway`: Permite a comunicação da VPC com a internet.
  - `aws_route_table`: Direciona o tráfego das sub-redes públicas para o Internet Gateway.
  - `aws_security_group`: Um Security Group padrão com regras de saída (egress) liberadas.

### 2. Módulo `frontend`

- **Propósito:** Provisiona a infraestrutura para hospedar a aplicação frontend (Next.js) de forma performática e segura.
- **Recursos Principais:**
  - `aws_s3_bucket`: Um bucket S3 configurado para ser **privado**, onde os arquivos estáticos do build do Next.js serão armazenados.
  - `aws_cloudfront_distribution`: Uma distribuição de CDN que entrega o conteúdo do S3 globalmente, com baixa latência e sob HTTPS.
  - `aws_cloudfront_origin_access_control (OAC)`: Mecanismo moderno e seguro que garante que o bucket S3 só possa ser acessado pelo CloudFront.

### 3. Módulo `rds`

- **Propósito:** Cria o banco de dados relacional gerenciado para a aplicação.
- **Recursos Principais:**
  - `aws_db_instance`: Uma instância de banco de dados PostgreSQL, configurada com a classe `db.t2.micro` e 20GB de armazenamento para se manter no **Nível Gratuito** da AWS.
  - `aws_db_subnet_group`: Agrupa as sub-redes onde o RDS pode ser implantado.
  - `aws_security_group`: Um firewall específico para o banco de dados. Por padrão, ele não permite nenhuma conexão de entrada.

### 4. Módulo `ecs`

- **Propósito:** Orquestra a execução do container da aplicação backend (NestJS).
- **Recursos Principais:**
  - `aws_ecr_repository`: Um repositório privado para armazenar as imagens Docker do backend.
  - `aws_ecs_cluster`: Um cluster lógico para agrupar os serviços e tarefas do ECS.
  - `aws_launch_configuration` & `aws_autoscaling_group`: Define e gerencia a instância **EC2 `t2.micro`** (Nível Gratuito) que irá rodar o contêiner.
  - `aws_lb` (Application Load Balancer): Recebe o tráfego HTTP da internet e o direciona para o contêiner do backend.
  - `aws_ecs_task_definition`: A "receita" do contêiner, especificando a imagem Docker, CPU/memória, portas e variáveis de ambiente (como as credenciais do banco de dados).
  - `aws_ecs_service`: Garante que o número desejado de tarefas (contêineres) esteja sempre rodando e as registra no Load Balancer.
  - `aws_cloudwatch_log_group`: Centraliza os logs da aplicação backend, essencial para depuração.

## Orquestração na Raiz

Os arquivos na raiz (`main.tf`, `variables.tf`, `outputs.tf`) são responsáveis por conectar todos os módulos.

- **`variables.tf`**: Define as entradas globais do projeto, como a região da AWS e as credenciais sensíveis (senhas de banco de dados, segredos JWT), que são solicitadas no momento do `apply`.

- **`outputs.tf`**: Expõe as saídas mais importantes da infraestrutura, como a URL final do frontend e do backend. Esses valores são impressos no terminal após a execução do `terraform apply`.

- **`main.tf`**:
  - Declara o uso de cada módulo, passando as variáveis necessárias.
  - Orquestra a dependência entre os módulos. Por exemplo, passa o `vpc_id` do módulo `vpc` para os outros módulos.
  - **Resolve a dependência circular** entre `ecs` e `rds` através de um recurso `aws_security_group_rule`. Este recurso cria a regra que permite ao Security Group do backend (`ecs`) acessar o Security Group do banco de dados (`rds`) na porta 5432, de forma desacoplada.

## Como Executar

1.  **Inicializar:**
    ```sh
    terraform init
    ```
2.  **Planejar (Revisar o que será criado):**
    ```sh
    terraform plan
    ```
3.  **Aplicar (Criar a infraestrutura):**
    ```sh
    terraform apply
    ```
    O Terraform solicitará os valores para as variáveis sensíveis (senhas).