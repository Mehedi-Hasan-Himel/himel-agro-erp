import jsPDF from "jspdf";
import { toPng } from "html-to-image";

export async function exportPedigreeToPdf(
  elementId: string,
  filename: string = "Himel-Agro-Pedigree-Certificate.pdf"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PDF export.`);
  }

  try {
    // html-to-image uses browser-native SVG foreignObject canvas rendering,
    // which natively supports Tailwind CSS v4 and all modern color formats (oklch, lab, color-mix)
    const imgData = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Measure rendered image dimensions to maintain exact aspect ratio
    const img = document.createElement("img");
    img.src = imgData;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load rendered image into PDF."));
    });

    const horizontalMargin = 8; // 8mm margin
    const availableWidth = pageWidth - horizontalMargin * 2;
    const availableHeight = pageHeight - 16;

    const imgNaturalWidth = img.naturalWidth || 1000;
    const imgNaturalHeight = img.naturalHeight || 700;

    let targetWidth = availableWidth;
    let targetHeight = (imgNaturalHeight * targetWidth) / imgNaturalWidth;

    if (targetHeight > availableHeight) {
      targetHeight = availableHeight;
      targetWidth = (imgNaturalWidth * targetHeight) / imgNaturalHeight;
    }

    const posX = (pageWidth - targetWidth) / 2;
    const posY = (pageHeight - targetHeight) / 2;

    pdf.addImage(imgData, "PNG", posX, posY, targetWidth, targetHeight, undefined, "FAST");
    pdf.save(filename);
  } catch (err) {
    console.error("PDF generation error:", err);
    throw err;
  }
}
