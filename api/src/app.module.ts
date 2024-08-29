import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MeasureModule } from './modules/measure/measure.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', '/images'),
      serveRoot: '/images/',
    }),
    MeasureModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
