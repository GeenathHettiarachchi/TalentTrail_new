package com.internsystem.internmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    // This line reads the email address from your application.properties file
    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendInternshipAlert(String toEmail, String internName, LocalDate endDate) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Internship End Date Alert");

            // Format the date nicely for the email body (e.g., "October 29, 2025")
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
            String formattedDate = endDate.format(formatter);

            // Create the email message text
            String text = String.format(
                "Dear %s,\n\n" +
                "This is a reminder that your internship is scheduled to end on %s.\n\n" +
                "Please coordinate with your manager to ensure a smooth handover of your work in progress.\n\n" +
                "Thank you,\n" +
                "HR Department",
                internName,
                formattedDate
            );

            message.setText(text);
            javaMailSender.send(message);
            System.out.println("Successfully sent alert email to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }
}