export const getPdfPageDimensions = async (pdfFile) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = async function() {
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf');
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        const loadingTask = pdfjs.getDocument({ data: fileReader.result });
        const pdf = await loadingTask.promise;

        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          pages.push({
            pageNumber: i,
            width: viewport.width,
            height: viewport.height
          });
        }

        resolve(pages);
      } catch (error) {
        reject(error);
      }
    };

    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(pdfFile);
  });
};

export const convertCoordinatesToPdfSpace = (x, y, width, height, canvasWidth, canvasHeight, pdfWidth, pdfHeight) => {
  const scaleX = pdfWidth / canvasWidth;
  const scaleY = pdfHeight / canvasHeight;

  return {
    x: x * scaleX,
    y: y * scaleY,
    width: width * scaleX,
    height: height * scaleY
  };
};

export const convertPdfCoordinatesToCanvas = (x, y, width, height, canvasWidth, canvasHeight, pdfWidth, pdfHeight) => {
  const scaleX = canvasWidth / pdfWidth;
  const scaleY = canvasHeight / pdfHeight;

  return {
    x: x * scaleX,
    y: y * scaleY,
    width: width * scaleX,
    height: height * scaleY
  };
};

export const downloadPdf = (url, filename = 'document.pdf') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
