// NestJS 서버용 메트릭 (Product Domain Server) - CommonJS 버전
const { Injectable, NestMiddleware } = require('@nestjs/common');
const client = require('prom-client');

// 기본 메트릭 활성화
client.collectDefaultMetrics({
  timeout: 5000,
  prefix: 'nestjs_'
});

// HTTP 메트릭
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'service'],
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

// 상품 관련 메트릭
const productOperations = new client.Counter({
  name: 'product_operations_total',
  help: 'Total product operations',
  labelNames: ['operation', 'status', 'service'] // create, read, update, delete
});

const productViews = new client.Counter({
  name: 'product_views_total',
  help: 'Total product page views',
  labelNames: ['product_id', 'category', 'service']
});

const categoryOperations = new client.Counter({
  name: 'category_operations_total',
  help: 'Total category operations',
  labelNames: ['operation', 'category_id', 'service']
});

const imageUploadOperations = new client.Counter({
  name: 'image_upload_operations_total',
  help: 'Total image upload operations',
  labelNames: ['status', 'size_bucket', 'service'] // success, failure / small, medium, large
});

const databaseQueries = new client.Counter({
  name: 'database_queries_total',
  help: 'Total database queries',
  labelNames: ['operation', 'table', 'status', 'service']
});

const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query duration',
  labelNames: ['operation', 'table', 'service'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2]
});

// Event Loop Lag 메트릭
const eventLoopLag = new client.Histogram({
  name: 'nestjs_event_loop_lag_seconds',
  help: 'Event loop lag in seconds',
  labelNames: ['service'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

// Event Loop Lag 측정 함수
function measureEventLoopLag(serviceName = 'product-server') {
  const start = process.hrtime.bigint();
  setImmediate(() => {
    const lag = Number(process.hrtime.bigint() - start) / 1e9; // 나노초를 초로 변환
    eventLoopLag.labels(serviceName).observe(lag);
  });
}

// 메트릭 미들웨어
class MetricsMiddleware {
  use(req, res, next) {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      const route = req.route?.path || req.path;
      
      httpRequestsTotal.inc({
        method: req.method,
        route: route,
        status_code: res.statusCode.toString(),
        service: 'product-server'
      });

      httpRequestDuration.observe({
        method: req.method,
        route: route,
        service: 'product-server'
      }, duration);
    });

    next();
  }
}

// 비즈니스 메트릭 서비스
class ProductMetricsService {
  // 상품 작업 기록
  recordProductOperation(operation, status) {
    productOperations.inc({ operation, status, service: 'product-server' });
  }

  // 상품 조회 기록
  recordProductView(productId, category) {
    productViews.inc({ 
      product_id: productId, 
      category: category, 
      service: 'product-server' 
    });
  }

  // 카테고리 작업 기록
  recordCategoryOperation(operation, categoryId) {
    categoryOperations.inc({ 
      operation, 
      category_id: categoryId, 
      service: 'product-server' 
    });
  }

  // 이미지 업로드 기록
  recordImageUpload(status, fileSize) {
    let sizeBucket = 'small';
    if (fileSize > 1024 * 1024) sizeBucket = 'large';
    else if (fileSize > 512 * 1024) sizeBucket = 'medium';

    imageUploadOperations.inc({ 
      status, 
      size_bucket: sizeBucket, 
      service: 'product-server' 
    });
  }

  // 데이터베이스 쿼리 기록
  recordDatabaseQuery(operation, table, status, duration) {
    databaseQueries.inc({ operation, table, status, service: 'product-server' });
    databaseQueryDuration.observe({ operation, table, service: 'product-server' }, duration);
  }

  // 상품 생성 성공
  recordProductCreated(categoryId) {
    this.recordProductOperation('create', 'success');
    this.recordCategoryOperation('product_added', categoryId);
  }

  // 상품 생성 실패
  recordProductCreationFailed(reason) {
    this.recordProductOperation('create', 'failure');
  }

  // 상품 조회 (상세 페이지)
  recordProductDetailView(productId, category) {
    this.recordProductView(productId, category);
    this.recordProductOperation('read', 'success');
  }

  // 상품 업데이트
  recordProductUpdated(productId) {
    this.recordProductOperation('update', 'success');
  }

  // 상품 삭제
  recordProductDeleted(productId) {
    this.recordProductOperation('delete', 'success');
  }

  // Event Loop Lag 측정
  measureEventLoopLag(service = 'product-server') {
    measureEventLoopLag(service);
  }

  // Event Loop Lag 정기 측정 시작
  startEventLoopLagMeasurement(service = 'product-server', intervalMs = 5000) {
    return setInterval(() => {
      measureEventLoopLag(service);
    }, intervalMs);
  }
}

// 데이터베이스 메트릭 인터셉터
class DatabaseMetricsInterceptor {
  constructor(metricsService) {
    this.metricsService = metricsService;
  }

  intercept(context, next) {
    const startTime = Date.now();
    const handler = context.getHandler();
    const operation = handler.name; // 메서드 이름
    
    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService.recordDatabaseQuery(operation, 'products', 'success', duration);
        },
        error: () => {
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService.recordDatabaseQuery(operation, 'products', 'error', duration);
        }
      })
    );
  }
}

module.exports = {
  MetricsMiddleware,
  ProductMetricsService,
  DatabaseMetricsInterceptor,
  client,
  eventLoopLag,
  measureEventLoopLag
};