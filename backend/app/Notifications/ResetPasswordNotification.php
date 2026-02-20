<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends BaseResetPassword
{
    public function toMail($notifiable)
    {
        $url = url('/reset-password/'.$this->token.'?email='.$notifiable->email);

        return (new MailMessage)
            ->subject('Відновлення паролю - MedPlus')
            ->view('emails.reset-password', [
                'url' => $url,
                'user' => $notifiable,
            ]);
    }
}
