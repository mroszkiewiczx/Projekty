import {
  EmailTemplate,
  EmailMessage,
  SchoolWelcomeData,
  TeacherInviteData,
  MaterialGeneratedData,
  UsageWarningData,
  RenewalReminderData
} from '@/types/email'

export const emailService = {
  async sendSchoolWelcome(email: string, data: SchoolWelcomeData): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to School_AI_Custom!',
      template: 'school_welcome',
      data,
      htmlContent: this.renderSchoolWelcome(data)
    })
  },

  async sendTeacherInvite(email: string, data: TeacherInviteData): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `You've been invited to join ${data.schoolName}`,
      template: 'teacher_invite',
      data,
      htmlContent: this.renderTeacherInvite(data)
    })
  },

  async sendMaterialGenerated(email: string, data: MaterialGeneratedData): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Your ${data.materialType} "${data.materialTitle}" is ready!`,
      template: 'material_generated',
      data,
      htmlContent: this.renderMaterialGenerated(data)
    })
  },

  async sendUsageWarning(email: string, data: UsageWarningData): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `⚠️ ${data.schoolName}: You're at ${data.usagePercentage}% of your monthly limit`,
      template: 'usage_warning',
      data,
      htmlContent: this.renderUsageWarning(data)
    })
  },

  async sendRenewalReminder(email: string, data: RenewalReminderData): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Your School_AI_Custom ${data.planName} subscription renews soon`,
      template: 'renewal_reminder',
      data,
      htmlContent: this.renderRenewalReminder(data)
    })
  },

  async sendEmail(message: EmailMessage): Promise<void> {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  },

  renderSchoolWelcome(data: SchoolWelcomeData): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #005BAC;">Welcome to School_AI_Custom! 🎉</h1>
            <p>Hi ${data.schoolName},</p>
            <p>Your account has been set up successfully. You're now ready to start generating AI-powered educational materials!</p>

            <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Getting Started</h3>
              <ol>
                <li>Log in to your account: <a href="${data.loginUrl}">${data.loginUrl}</a></li>
                <li>Invite your teachers to collaborate</li>
                <li>Start generating lessons, quizzes, and more</li>
              </ol>
            </div>

            <p>Your account admin email is: <strong>${data.adminEmail}</strong></p>

            <p>Questions? Check our documentation or contact support@schoolaicustom.com</p>

            <p>Happy teaching!</p>
            <p><strong>The School_AI_Custom Team</strong></p>
          </div>
        </body>
      </html>
    `
  },

  renderTeacherInvite(data: TeacherInviteData): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #005BAC;">You're invited to ${data.schoolName}! 👋</h1>
            <p>Hi,</p>
            <p>You've been invited to join <strong>${data.schoolName}</strong> on School_AI_Custom.</p>

            <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 15px 0;">Click the button below to accept the invitation:</p>
              <a href="${data.inviteLink}" style="background-color: #005BAC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Join ${data.schoolName}
              </a>
            </div>

            <p>Or copy this invite code: <code style="background: #f0f0f0; padding: 5px 10px;">${data.inviteCode}</code></p>
            <p>This invitation expires on ${data.expiresAt.toLocaleDateString()}</p>

            <p><strong>The School_AI_Custom Team</strong></p>
          </div>
        </body>
      </html>
    `
  },

  renderMaterialGenerated(data: MaterialGeneratedData): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #61CE70;">Your ${data.materialType} is ready! ✨</h1>
            <p>Hi ${data.teacherName},</p>
            <p>Your <strong>${data.materialType}</strong> "<strong>${data.materialTitle}</strong>" has been generated successfully!</p>

            <div style="background-color: #f0fff5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <a href="${data.materialLink}" style="background-color: #61CE70; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Your ${data.materialType}
              </a>
            </div>

            <p>You can now:</p>
            <ul>
              <li>Review and edit the content</li>
              <li>Publish and share with students</li>
              <li>Add to your library for future use</li>
            </ul>

            <p><strong>The School_AI_Custom Team</strong></p>
          </div>
        </body>
      </html>
    `
  },

  renderUsageWarning(data: UsageWarningData): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #C97B10;">⚠️ Usage Alert for ${data.schoolName}</h1>
            <p>You're currently at <strong>${data.usagePercentage}%</strong> of your monthly limit.</p>

            <div style="background-color: #fff5e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Current Usage:</strong> ${data.monthlyUsed} / ${data.monthlyLimit} materials</p>
              <p><strong>Remaining:</strong> ${data.monthlyLimit - data.monthlyUsed} materials</p>
            </div>

            <p>Once you reach your limit, you won't be able to generate new materials until your subscription renews or you upgrade your plan.</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${data.upgradeLinkUrl}" style="background-color: #005BAC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Upgrade Your Plan
              </a>
            </div>

            <p><strong>The School_AI_Custom Team</strong></p>
          </div>
        </body>
      </html>
    `
  },

  renderRenewalReminder(data: RenewalReminderData): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #005BAC;">Your subscription renews soon 📅</h1>
            <p>Hi ${data.schoolName},</p>
            <p>This is a reminder that your <strong>${data.planName}</strong> plan subscription will renew on <strong>${data.renewalDate.toLocaleDateString()}</strong>.</p>

            <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Plan:</strong> ${data.planName}</p>
              <p><strong>Renewal Amount:</strong> $${data.monthlyAmount}/month</p>
              <p><strong>Renewal Date:</strong> ${data.renewalDate.toLocaleDateString()}</p>
            </div>

            <p>No action is needed — your subscription will automatically renew. If you'd like to make changes:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${data.manageLink}" style="background-color: #005BAC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Manage Your Subscription
              </a>
            </div>

            <p><strong>The School_AI_Custom Team</strong></p>
          </div>
        </body>
      </html>
    `
  }
}
