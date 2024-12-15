package com.springboot.service.event;

import com.springboot.service.email.EmailMessage;
import com.springboot.service.email.EmailService;
import com.springboot.user.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.mail.MailSendException;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Component;

@Component
@EnableAsync
@Slf4j
public class UserRegisterEventHandler {
    private final EmailService emailService;
    public UserRegisterEventHandler(EmailService emailService) {
        this.emailService = emailService;
    }
    @EventListener
    public void listen(RegistrationEvent event) {
        try{
            EmailMessage emailMessage = EmailMessage.builder()
                    .to(event.getUser().getEmail())
                    .subject("회원가입을 위한 인증코드 발송")
                    .build();
            emailService.sendMail(emailMessage,"email");

        } catch (MailSendException e) {
             log.error("MailSendException");
        } catch (RuntimeException e) {
            log.error("RuntimeException : while sending");
        }
    }
}
