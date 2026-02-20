<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Підтвердження Email</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f8fb; font-family: Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f8fb; padding:40px 0;">
    <tr>
        <td align="center">

            <!-- Карточка -->
            <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.05); padding:40px;">

                <!-- Логотип / Назва -->
                <tr>
                    <td align="center" style="padding-bottom:20px;">
                        <h1 style="margin:0; color:#1e88e5; font-size:24px;">
                            MedPlus
                        </h1>
                        <p style="margin:5px 0 0 0; color:#6c757d; font-size:14px;">
                            Приватна медична клініка
                        </p>
                    </td>
                </tr>

                <!-- Контент -->
                <tr>
                    <td style="color:#333333; font-size:16px; line-height:1.6;">
                        <p>Вітаємо 👋</p>

                        <p>
                            Дякуємо за реєстрацію в клініці <strong>MedPlus</strong>.
                            Для завершення створення облікового запису необхідно підтвердити вашу електронну адресу.
                        </p>

                        <p style="text-align:center; margin:30px 0;">
                            <a href="{{ url('/api/auth/verify-email/'.$token) }}"
                               style="background-color:#1e88e5;
                                          color:#ffffff;
                                          padding:14px 28px;
                                          text-decoration:none;
                                          border-radius:6px;
                                          font-weight:bold;
                                          display:inline-block;">
                                Підтвердити Email
                            </a>
                        </p>

                        <p style="font-size:14px; color:#6c757d;">
                            Якщо ви не реєструвалися на нашому сайті — просто проігноруйте цей лист.
                        </p>
                    </td>
                </tr>

                <!-- Футер -->
                <tr>
                    <td style="padding-top:30px; font-size:12px; color:#9aa0a6; text-align:center;">
                        © {{ date('Y') }} MedPlus. Усі права захищені.<br>
                        м. Київ | +380 (00) 000 00 00
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
