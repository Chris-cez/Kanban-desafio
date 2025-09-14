# 1. Bucket S3 para hospedar os arquivos do site estático (React/Next.js)
resource "aws_s3_bucket" "site" {
  # O nome do bucket precisa ser globalmente único. Adicionar um hash aleatório ajuda.
  bucket = "${var.project_name}-frontend-bucket-${random_string.bucket_suffix.result}"
}

# Permite que o CloudFront acesse o bucket S3 de forma segura
resource "aws_s3_bucket_policy" "allow_cloudfront" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.allow_cloudfront.json
}

# Configura o bucket para ser um site estático
resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html" # Redireciona todos os erros para o index.html (bom para SPAs)
  }
}

# 2. CloudFront para distribuir o conteúdo do S3
resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.site.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.site.id

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # Configuração para Single Page Applications (SPA) como React
  custom_error_response {
    error_caching_min_ttl = 0
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# 3. Recursos Auxiliares

# Gera um sufixo aleatório para o nome do bucket S3
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Define a política de permissão para o CloudFront acessar o S3
data "aws_iam_policy_document" "allow_cloudfront" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.s3_distribution.arn]
    }
  }
}
