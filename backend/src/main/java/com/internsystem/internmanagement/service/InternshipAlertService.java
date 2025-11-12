package com.internsystem.internmanagement.service;

import com.internsystem.internmanagement.entity.Intern;
import com.internsystem.internmanagement.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InternshipAlertService {

    private final InternRepository internRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 * * * * *", zone = "Asia/Colombo")
    @Transactional
    public void checkInternshipEndDatesAndSendAlerts() {
        System.out.println("SCHEDULER: Running daily check for expiring internships...");

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysFromNow = today.plusDays(30);

        List<Intern> expiringInterns = internRepository.findByTrainingEndDateBetweenAndEndDateAlertSentFalse(today, thirtyDaysFromNow);

        if (expiringInterns.isEmpty()) {
            System.out.println("SCHEDULER: No interns needing an alert today. Task complete.");
            return;
        }

        System.out.printf("SCHEDULER: Found %d intern(s) to notify. Sending alerts...\n", expiringInterns.size());

        for (Intern intern : expiringInterns) {
            emailService.sendInternshipAlert(
                intern.getEmail(),
                intern.getName(),
                intern.getTrainingEndDate()
            );

            System.out.printf("SCHEDULER: Setting 'alert sent' flag for intern: %s\n", intern.getName());
            intern.setEndDateAlertSent(true);
            internRepository.save(intern);
        }

        System.out.println("SCHEDULER: All alerts have been sent. Task complete.");
    }
}