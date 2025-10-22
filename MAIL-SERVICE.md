# Mail Service Documentation

## Overview
The Mail Service provides email functionality for the Shop212 backend service, including welcome emails, password reset emails, order confirmations, and generic email sending capabilities.

## Features
- ✅ Password reset emails with secure tokens
- ✅ Welcome emails for new users
- ✅ Order confirmation emails
- ✅ Generic HTML email sending
- ✅ Handlebars template support
- ✅ Error handling and logging
- ✅ Configurable email providers

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
# Email Service Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@shop212.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
```

### Email Provider Examples

#### Gmail
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password  # Use App Password, not regular password
```

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailtrap (For Testing)
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-user
EMAIL_PASS=your-mailtrap-pass
```

## Available Methods

### 1. sendPasswordResetEmail
Sends a password reset email with a secure token.

```typescript
await mailService.sendPasswordResetEmail(
  'user@example.com',
  'John Doe',
  'reset-token-123'
);
```

### 2. sendWelcomeEmail
Sends a welcome email to new users.

```typescript
await mailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

### 3. sendOrderConfirmationEmail
Sends order confirmation with details.

```typescript
await mailService.sendOrderConfirmationEmail(
  'user@example.com',
  'John Doe',
  {
    orderId: 'ORD-12345',
    orderDate: '2025-10-21',
    totalAmount: '99.99',
    items: [
      { name: 'Product 1', quantity: 2, price: '29.99' },
      { name: 'Product 2', quantity: 1, price: '39.99' }
    ]
  }
);
```

### 4. sendGenericEmail
Sends custom HTML email.

```typescript
await mailService.sendGenericEmail(
  'user@example.com',
  'Custom Subject',
  '<h1>Custom HTML Content</h1>'
);
```

## Email Templates

Templates are located in `src/mail/templates/` and use Handlebars syntax:

- `reset-password.hbs` - Password reset email
- `welcome.hbs` - Welcome email for new users
- `order-confirmation.hbs` - Order confirmation email

### Template Variables

#### Reset Password Template
- `{{name}}` - User's full name
- `{{resetUrl}}` - Password reset URL with token

#### Welcome Template
- `{{name}}` - User's full name
- `{{loginUrl}}` - Login page URL

#### Order Confirmation Template
- `{{name}}` - User's full name
- `{{orderDetails.orderId}}` - Order ID
- `{{orderDetails.orderDate}}` - Order date
- `{{orderDetails.totalAmount}}` - Total amount
- `{{orderDetails.items}}` - Array of order items
- `{{trackingUrl}}` - Order tracking URL

## API Endpoints (Testing Only)

### Test Password Reset Email
```http
POST /mail/test/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "resetToken": "test-token-123"
}
```

### Test Welcome Email
```http
POST /mail/test/welcome
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Test Order Confirmation
```http
POST /mail/test/order-confirmation
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "orderDetails": {
    "orderId": "ORD-12345",
    "orderDate": "2025-10-21",
    "totalAmount": "99.99",
    "items": [
      { "name": "Product 1", "quantity": 2, "price": "29.99" }
    ]
  }
}
```

### Send Generic Email (Requires Authentication)
```http
POST /mail/send
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Test Subject",
  "html": "<h1>Test HTML Content</h1>"
}
```

## Integration Examples

### In Auth Service (Signup)
```typescript
// Send welcome email after successful signup
this.mailService.sendWelcomeEmail(email, fullName).catch(error => {
  console.error('Failed to send welcome email:', error);
});
```

### In Auth Service (Password Reset)
```typescript
// Send password reset email
await this.mailService.sendPasswordResetEmail(
  user.email, 
  user.fullName, 
  resetToken
);
```

### In Orders Service
```typescript
// Send order confirmation
await this.mailService.sendOrderConfirmationEmail(
  user.email,
  user.fullName,
  orderDetails
);
```

## Error Handling

The mail service includes comprehensive error handling:

- Logs successful email sends
- Logs errors with details
- Throws descriptive error messages
- Non-blocking for non-critical emails (welcome emails)

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select app: Mail, device: Other (Custom name)
   - Copy the generated 16-character password
3. **Use App Password** in EMAIL_PASS (not your regular password)

## Security Considerations

- Never expose email credentials in code
- Use environment variables for all configuration
- Consider using dedicated email services (SendGrid, AWS SES) for production
- Implement rate limiting for email endpoints
- Remove test endpoints in production

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check EMAIL_USER and EMAIL_PASS
   - For Gmail, ensure you're using App Password

2. **Connection Timeout**
   - Check EMAIL_HOST and EMAIL_PORT
   - Ensure firewall allows SMTP traffic

3. **Templates Not Found**
   - Check template path in MailModule
   - Ensure .hbs files exist in templates directory

4. **Emails Not Received**
   - Check spam folder
   - Verify recipient email address
   - Check email service logs

### Debugging

Enable debug logging by setting NODE_ENV=development and checking console output for detailed error messages.

## Production Recommendations

1. **Use Professional Email Service**: SendGrid, AWS SES, etc.
2. **Remove Test Endpoints**: Delete test endpoints from controller
3. **Implement Rate Limiting**: Prevent email spam
4. **Monitor Email Delivery**: Track bounce rates and delivery
5. **Use Email Templates**: Store templates in database for dynamic content
6. **Queue System**: Use Redis/Bull for high-volume email sending