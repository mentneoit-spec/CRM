const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

// Initialize SNS Client with the keys you just got from IAM
const snsClient = new SNSClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Sends an OTP via SMS using AWS SNS
 * @param {string} phoneNumber - User's phone (e.g., "+919876543210")
 * @param {string} otp - The 6-digit verification code
 */
const sendSMSOTP = async (phoneNumber, otp) => {
    const params = {
        Message: `Your Gravity CRM verification code is: ${otp}. It expires in 10 minutes.`,
        PhoneNumber: phoneNumber,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                DataType: 'String',
                StringValue: 'Gravity'
            },
            'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: 'Transactional'
            }
        }
    };

    try {
        const command = new PublishCommand(params);
        const response = await snsClient.send(command);
        console.log("SMS sent successfully! MessageId:", response.MessageId);
        return response;
    } catch (error) {
        console.error("AWS SNS Error:", error);
        throw error;
    }
};

module.exports = { sendSMSOTP };