"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const corsOriginConfig = configService.get('CORS_ORIGIN', 'http://localhost:3000');
    const allowedOrigins = corsOriginConfig
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: allowedOrigins.includes('*') ? true : allowedOrigins,
        credentials: true,
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Task Manager API')
        .setDescription('Task and issue tracker backend API documentation')
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    }, 'bearer')
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, swaggerDocument, {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
        },
    });
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map