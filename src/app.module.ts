import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { OrdersModule } from './orders/orders.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { MailController } from './mail/mail.controller';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'shop212.database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:".env"
    }),
    AuthModule,
    ProductsModule,
    CartModule,
    WishlistModule,
    OrdersModule,
    MailModule,
    UsersModule
  ],
  controllers: [AppController,  MailController],
  providers: [AppService,  MailService],
})
export class AppModule {}
