import { jsPDF } from 'jspdf';

export function downloadItineraryPdf(itinerary) {
  if (!itinerary) return;

  const doc = new jsPDF();
  let yPos = 20;
  const margin = 20;

  const checkPageBreak = (extraSpace = 10) => {
    if (yPos + extraSpace > 280) {
      doc.addPage();
      yPos = 20;
    }
  };

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`VoyageAI: ${itinerary.destination}`, margin, yPos);
  yPos += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const summaryText = `Duration: ${itinerary.duration} Days | Est. Total: ${itinerary.currency} ${itinerary.totalEstimatedCost}`;
  doc.text(summaryText.replace(/₹/g, 'Rs. '), margin, yPos);
  yPos += 15;

  itinerary.dailyPlans.forEach(day => {
    checkPageBreak(20);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Day ${day.day}: ${day.theme}`, margin, yPos);
    yPos += 10;

    day.activities.forEach(act => {
      checkPageBreak(15);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const safeCost = act.cost.replace(/₹/g, 'Rs. ');
      doc.text(`${act.time} - ${act.title} (${safeCost})`, margin, yPos);

      yPos += 6;

      doc.setFont('helvetica', 'normal');
      const splitDesc = doc.splitTextToSize(act.description, 170);
      doc.text(splitDesc, margin, yPos);
      yPos += (splitDesc.length * 6) + 4;
    });

    yPos += 5;
  });

  const fileName = `${itinerary.destination.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
  doc.save(fileName);
}
