const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create receipts directory if it doesn't exist
const receiptsDir = path.join(__dirname, '../receipts');
if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
}

const generatePaymentReceipt = async (paymentData) => {
    return new Promise((resolve, reject) => {
        try {
            const {
                paymentId,
                studentName,
                studentId,
                collegeName,
                amount,
                feeType,
                paymentDate,
                transactionId,
                paymentMethod,
            } = paymentData;

            // Create filename
            const filename = `receipt_${paymentId}_${Date.now()}.pdf`;
            const filepath = path.join(receiptsDir, filename);

            // Create PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
            });

            // Pipe to file
            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica').text(collegeName, { align: 'center' });
            doc.moveDown(1);

            // Receipt number and date
            doc.fontSize(10).font('Helvetica');
            doc.text(`Receipt No: ${paymentId.substring(0, 8).toUpperCase()}`, 50, doc.y);
            doc.text(`Date: ${new Date(paymentDate).toLocaleDateString('en-IN')}`, 300, doc.y - 15);
            doc.moveDown(1.5);

            // Divider line
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);

            // Student Information
            doc.fontSize(11).font('Helvetica-Bold').text('STUDENT INFORMATION', 50, doc.y);
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${studentName}`, 50, doc.y);
            doc.text(`Student ID: ${studentId}`, 50, doc.y);
            doc.moveDown(1);

            // Payment Details
            doc.fontSize(11).font('Helvetica-Bold').text('PAYMENT DETAILS', 50, doc.y);
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Fee Type: ${feeType}`, 50, doc.y);
            doc.text(`Amount Paid: ₹${amount.toLocaleString('en-IN')}`, 50, doc.y);
            doc.text(`Payment Method: ${paymentMethod === 'razorpay' ? 'Online (Razorpay)' : paymentMethod}`, 50, doc.y);
            doc.text(`Transaction ID: ${transactionId}`, 50, doc.y);
            doc.text(`Payment Date: ${new Date(paymentDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })}`, 50, doc.y);
            doc.moveDown(1.5);

            // Divider line
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);

            // Amount box
            doc.rect(50, doc.y, 495, 60).stroke();
            doc.fontSize(12).font('Helvetica-Bold').text('AMOUNT PAID', 60, doc.y + 10);
            doc.fontSize(20).font('Helvetica-Bold').text(`₹${amount.toLocaleString('en-IN')}`, 60, doc.y + 30);
            doc.moveDown(4);

            // Footer
            doc.fontSize(9).font('Helvetica').text('This is a computer-generated receipt. No signature required.', {
                align: 'center',
            });
            doc.moveDown(0.5);
            doc.fontSize(8).font('Helvetica').text('Thank you for your payment. Please keep this receipt for your records.', {
                align: 'center',
            });

            // Finalize PDF
            doc.end();

            // Resolve when stream finishes
            stream.on('finish', () => {
                resolve({
                    filename,
                    filepath,
                    url: `/receipts/${filename}`,
                });
            });

            stream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generatePaymentReceipt,
};
