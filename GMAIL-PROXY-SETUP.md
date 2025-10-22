# Gmail Proxy Setup Guide for Shop212

## Overview
This configuration allows you to:
- **Send emails through Gmail SMTP** using `cs5156023@gmail.com`
- **Display custom sender addresses** like `support@shop212.com`, `orders@shop212.com`
- **Route replies back to your Gmail** account

## Step-by-Step Setup

### 1. Enable Gmail App Password

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Navigate to Security** → **2-Step Verification**
3. **Enable 2-Factor Authentication** if not already enabled
4. **Generate App Password**:
   - Go to **Security** → **2-Step Verification** → **App passwords**
   - Select app: **Mail**
   - Select device: **Other (Custom name)** → Enter "Shop212 Backend"
   - **Copy the 16-character password** (format: xxxx xxxx xxxx xxxx)

### 2. Environment Configuration

Create a `.env` file in your project root with:

```env
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=cs5156023@gmail.com
EMAIL_PASS=your-16-character-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Other configs...
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

### 3. How It Works

#### Email Flow:
1. **Your backend** sends email via Gmail SMTP using `cs5156023@gmail.com`
2. **Recipients see** emails from `support@shop212.com`, `orders@shop212.com`, etc.
3. **Replies go to** `cs5156023@gmail.com` (via replyTo header)

#### Email Types:
- **Password Reset**: `"Shop212 Support" <support@shop212.com>`
- **Welcome Email**: `"Shop212 Team" <welcome@shop212.com>`
- **Order Confirmation**: `"Shop212 Orders" <orders@shop212.com>`
- **Generic Emails**: `"Shop212" <noreply@shop212.com>`

### 4. Test the Setup

Use these API endpoints to test:

#### Test Password Reset
```bash
POST http://localhost:4000/mail/test/reset-password
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User",
  "resetToken": "test-token-123"
}
```

#### Test Welcome Email
```bash
POST http://localhost:4000/mail/test/welcome
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User"
}
```

### 5. What Recipients Will See

#### In Their Inbox:
- **From**: Shop212 Support <support@shop212.com>
- **Reply-To**: cs5156023@gmail.com
- **Subject**: Reset your password - Shop212

#### When They Reply:
- Reply will go to `cs5156023@gmail.com`
- You'll receive it in your Gmail inbox

### 6. Potential Issues & Solutions

#### Issue 1: "Authentication Failed"
**Solution**: 
- Ensure 2FA is enabled on Gmail
- Use App Password (not regular password)
- Remove spaces from app password

#### Issue 2: "Sender Domain Not Verified" 
**Solution**:
- This is expected when using custom domains
- Gmail allows this for SMTP relay
- Recipients might see "via gmail.com" in some email clients

#### Issue 3: Emails Going to Spam
**Solutions**:
- Add SPF record to your domain (if you own shop212.com)
- Keep email content professional
- Avoid spam trigger words

### 7. Domain Configuration (Optional)

If you own `shop212.com` domain, add these DNS records for better deliverability:

#### SPF Record:
```
TXT @ "v=spf1 include:_spf.google.com ~all"
```

#### DKIM (Gmail will handle this)
Gmail automatically signs emails with DKIM when using their SMTP.

### 8. Production Considerations

#### For Production:
1. **Consider dedicated email service**: SendGrid, AWS SES, Mailgun
2. **Purchase shop212.com domain** for legitimate sender addresses
3. **Set up proper DNS records** (SPF, DKIM, DMARC)
4. **Monitor email reputation**

#### Current Setup Limitations:
- Some email clients may show "via gmail.com"
- Limited sending quotas (Gmail: 500 emails/day for free accounts)
- Potential deliverability issues without proper domain setup

### 9. Testing Commands

```bash
# Test in your terminal
curl -X POST http://localhost:4000/mail/test/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@example.com",
    "name": "Test User",
    "resetToken": "test-123"
  }'
```

### 10. Monitoring

Check your application logs for:
- Successful email sends
- Error messages
- Email delivery confirmations

The service logs will show:
```
[MailService] Password reset email sent to user@example.com
[MailService] Welcome email sent to user@example.com
```

## Summary

✅ **Emails send through**: `cs5156023@gmail.com` (Gmail SMTP)  
✅ **Recipients see from**: `support@shop212.com`, `orders@shop212.com`, etc.  
✅ **Replies go to**: `cs5156023@gmail.com`  
✅ **Professional appearance**: Custom sender names and addresses  
✅ **Easy setup**: Just Gmail app password needed  

Your email service is now configured to use your Gmail account while presenting a professional Shop212 brand to recipients!