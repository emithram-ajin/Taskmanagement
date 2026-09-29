import cron from 'node-cron';
import Task from '../models/Task.js';
import { sendEmail } from '../services/emailService.js';
import { taskOverdueTemplate, taskOverdueText } from './taskEmailTemplate.js';

export const initCronJobs = () => {
    // Run every day at 8:00 AM (server time)
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log("Running overdue tasks cron job...");
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 2 days ago start
            const twoDaysAgoStart = new Date(today);
            twoDaysAgoStart.setDate(twoDaysAgoStart.getDate() - 2);

            // 1 day ago start
            const oneDayAgoStart = new Date(today);
            oneDayAgoStart.setDate(oneDayAgoStart.getDate() - 1);

            // Find tasks where deadline is exactly 2 days ago
            const overdueTasks = await Task.find({
                status: { $ne: 'completed' },
                deadline: {
                    $gte: twoDaysAgoStart,
                    $lt: oneDayAgoStart
                }
            }).populate("assignee", "name email").populate("project", "projectName");

            if (overdueTasks.length > 0) {
                console.log(`Found ${overdueTasks.length} tasks that are 2 days overdue.`);
            }

            for (const task of overdueTasks) {
                if (task.assignee?.email) {
                    await sendEmail({
                        to: task.assignee.email,
                        subject: `Action Required: Task Overdue - ${task.title}`,
                        html: taskOverdueTemplate(task),
                        text: taskOverdueText(task),
                    }).catch(err => console.error("Failed to send overdue email:", err));
                    
                    console.log(`Sent overdue email to ${task.assignee.email} for task ${task._id}`);
                }
            }
        } catch (error) {
            console.error("Error running overdue tasks cron job:", error);
        }
    });
    console.log("Cron jobs initialized.");
};
