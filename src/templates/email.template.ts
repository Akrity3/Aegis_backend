export const getEmailVerificationTemplate = (name: string, token: string, verificationUrl: string): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Aegis+</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background-color: #f9f9f9;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #4a90e2;
                margin: 0;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #4a90e2;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #666;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Aegis+ Safety</h1>
            </div>
            <div class="content">
                <p>Hello ${name},</p>
                <p>Thank you for registering with Aegis+. To complete your registration and ensure the security of your account, please verify your email address.</p>
                <p>Click the button below to verify your email:</p>
                <center>
                    <a href="${verificationUrl}" class="button">Verify Email</a>
                </center>
                <p>Or copy and paste this token into the verification form:</p>
                <p style="background-color: #eee; padding: 10px; border-radius: 5px; font-family: monospace;">${token}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account with Aegis+, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Aegis+ Safety. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getPasswordResetTemplate = (name: string, token: string, resetUrl: string): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Aegis+</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background-color: #f9f9f9;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #4a90e2;
                margin: 0;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #4a90e2;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #666;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Aegis+ Safety</h1>
            </div>
            <div class="content">
                <p>Hello ${name},</p>
                <p>We received a request to reset your password for your Aegis+ account.</p>
                <p>Click the button below to reset your password:</p>
                <center>
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </center>
                <p>Or copy and paste this token into the password reset form:</p>
                <p style="background-color: #eee; padding: 10px; border-radius: 5px; font-family: monospace;">${token}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Aegis+ Safety. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
