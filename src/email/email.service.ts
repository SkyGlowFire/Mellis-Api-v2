import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer'
import * as fs from 'fs'
import * as path from 'path'
import handlebars from 'handlebars'

export interface MailOptions{
    email: string
    subject: string
    html: string
}

@Injectable()
export class EmailService {
    constructor(private configService: ConfigService){}

    async sendMail(options: MailOptions){
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: this.configService.get('GMAIL_USER'),
                pass: this.configService.get('GMAIL_PASSWORD'),
            },
        });
        const mailOptions = {
            from: `"${this.configService.get('FROM_NAME')}" <${this.configService.get('FROM_EMAIL')}>`,
            to: `${options.email}`,
            subject: options.subject,
            html: options.html,
          };
        await transporter.sendMail(mailOptions);
    }

    formTemplate(filename: string, variables: Object){
        const html = fs.readFileSync(path.join(__dirname, '..', 'public/templates', `${filename}.html`), {encoding: 'utf-8'})
        const template = handlebars.compile(html)
        return template(variables)
    }

    async sendPasswordChangeEmail(email: string, token: string){
        const resetUrl = `${this.configService.get('CLIENT_URI')}/auth/reset-password/${token}`
        const template = this.formTemplate('password-recovery', {link: resetUrl})
        await this.sendMail({email, subject: 'Password recovery', html: template})
    }
}
