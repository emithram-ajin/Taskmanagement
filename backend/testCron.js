import "dotenv/config";
import connectDB from "./src/config/db.js";
import Task from "./src/models/Task.js";
import "./src/models/User.js";
import "./src/models/Project.js";
import { sendEmail } from "./src/services/emailService.js";
import { taskOverdueTemplate, taskOverdueText } from "./src/utils/taskEmailTemplate.js";

const testCronJob = async () => {
    await connectDB();
    console.log("Connected to DB, running overdue tasks cron job test...");
    
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2 days ago start
        const twoDaysAgoStart = new Date(today);
        twoDaysAgoStart.setDate(twoDaysAgoStart.getDate() - 2);

        // 1 day ago start
        const oneDayAgoStart = new Date(today);
        oneDayAgoStart.setDate(oneDayAgoStart.getDate() - 1);

        console.log(`Looking for tasks with deadline between ${twoDaysAgoStart} and ${oneDayAgoStart}`);

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
        } else {
            console.log("No 2-day overdue tasks found.");
        }

        for (const task of overdueTasks) {
            console.log(`Found task: ${task.title} (Deadline: ${task.deadline}) - Assignee: ${task.assignee?.email}`);
            
            // To actually send the email, uncomment the following block, but for safety in tests we might just log:
            
            if (task.assignee?.email) {
                console.log(`Attempting to send email to ${task.assignee.email}...`);
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
        console.error("Error running overdue tasks cron job test:", error);
    }
    
    process.exit(0);
};

testCronJob();
