const cron = require('node-cron');
const moment = require('moment');
const LeadModel = require('./Models/LeadModel.js')
// Run every minute
cron.schedule('* * * * *', async () => {
    const now = moment(); // Current server time
    const currentDate = now.format('YYYY-MM-DD');
    const currentTime = now.format('HH:mm');

    const reminders = await LeadModel.find({
        nextFollowUpDate: { $lte: new Date(currentDate) },
        nextFollowUpTime: currentTime,
        notified: false,
    });
    // console.log("15")
    for (const reminder of reminders) {
        // Send notification (Email/SMS/Socket/Push/etc.)
        console.log("📢 Notify: " + "Call " + `${reminder._id}` + " client for follow-up");
        // ${reminder.message}
        io.to(reminder._id).emit('followupReminder', { message: "Call " + `${reminder._id}` + " client for follow-up" });

        // Mark as notified
        reminder.notified = true;
        await reminder.save();
    }
});
