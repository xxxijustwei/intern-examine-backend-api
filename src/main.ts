import { NestFactory, Reflector } from '@nestjs/core';
import morgan from 'morgan';
import { AppModule } from './router/app/app.module';
import { ResponseInterceptor } from './interceptor';
import { JwtService } from '@nestjs/jwt';
import { UserAuthGuard } from './guards';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { patchNestjsSwagger, ZodValidationPipe } from '@anatine/zod-nestjs';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // cors
    app.enableCors();

    // morgan
    morgan.token('date', () => {
        const date = new Date();
        return date.toISOString();
    });

    // swagger
    patchNestjsSwagger();
    const config = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('The API Documentation')
        .setVersion('1.0')
        .addTag('API')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    // global interceptor
    const reflector = app.get(Reflector);
    const jwt = app.select(AppModule).get(JwtService);

    app.use(morgan(':date :method :url :status :response-time ms'));
    app.useGlobalInterceptors(new ResponseInterceptor());

    // global guard/pipe
    app.useGlobalGuards(new UserAuthGuard(jwt, reflector));
    app.useGlobalPipes(new ZodValidationPipe());

    await app.listen(8080);
}

bootstrap();