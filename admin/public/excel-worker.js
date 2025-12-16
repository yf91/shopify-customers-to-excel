// Excel Worker für asynchrone Verarbeitung
/* global XLSX, self */
importScripts(
  "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"
);

self.onmessage = async function (event) {
  try {
    const { type, data } = event.data;
    if (type === "EXPORT_CUSTOMERS") {
      const { customers } = data;

      const dataToWrite = [
        ["Email", "Country", "Shop", "Added At"],
        ...customers.map((customer) => [
          customer.email,
          customer.defaultAddressCountry,
          customer.shop,
          customer.addedAt,
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(dataToWrite);
      worksheet["!cols"] = [
        { wch: 30 }, // Email
        { wch: 30 }, // Country
        { wch: 30 }, // Shop
        { wch: 30 }, // Added At
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

      // Excel als Binary String exportieren
      const wbout = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "binary",
        compression: true,
      });

      // Binary String zu Array Buffer konvertieren
      const buf = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xff;
      }

      // Ergebnis senden
      self.postMessage({
        status: "SUCCESS",
        data: {
          buffer: buf,
        },
      });
    }
  } catch (error) {
    self.postMessage({
      status: "ERROR",
      error: error.message,
    });
  }
};
