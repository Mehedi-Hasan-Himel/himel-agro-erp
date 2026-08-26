import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportPedigreeToPdf(
  elementId: string,
  filename: string = "Himel-Agro-Pedigree-Certificate.pdf"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PDF export.`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // high quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    // A4 landscape or portrait
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight > pageHeight) {
      // Fit to height if image is taller than page
      const fitWidth = (canvas.width * pageHeight) / canvas.height;
      const marginX = (pageWidth - fitWidth) / 2;
      pdf.addImage(imgData, "PNG", marginX, 0, fitWidth, pageHeight);
    } else {
      const marginY = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, "PNG", 0, marginY, imgWidth, imgHeight);
    }

    pdf.save(filename);
  } catch (err) {
    console.error("PDF generation error:", err);
    throw err;
  }
}
